#!/usr/bin/env python3
"""
Cloudflare R2 图片上传脚本
用于将图片上传到 Cloudflare R2 存储并生成 CDN 链接
"""

import os
import sys
import mimetypes
import argparse
import boto3
from botocore.exceptions import NoCredentialsError, ClientError
from urllib.parse import quote
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class R2Uploader:
    def __init__(self):
        """初始化 R2 上传器（优先从环境变量读取配置）"""
        # Cloudflare R2 配置 - 先读环境变量，缺失则回退到默认（.env 建议覆盖）
        self.STORAGE_REGION = os.environ.get("STORAGE_REGION", "auto")
        self.STORAGE_BUCKET_NAME = os.environ.get("STORAGE_BUCKET_NAME", "detector-de-ia")
        self.STORAGE_ACCESS_KEY_ID = os.environ.get("STORAGE_ACCESS_KEY_ID", "aa379abf2ee7b91e9246fbb5f3490bb8")
        self.STORAGE_SECRET_ACCESS_KEY = os.environ.get("STORAGE_SECRET_ACCESS_KEY", "02dc099905166d493fa1410d8d941bc9fc82316e45ca32207b02a801dd760df6")
        self.STORAGE_ENDPOINT = os.environ.get(
            "STORAGE_ENDPOINT",
            "https://pub-a9525ed8fd554c05ba42ef72c86b7063.r2.dev",
        )
        self.STORAGE_FORCE_PATH_STYLE = str(
            os.environ.get("STORAGE_FORCE_PATH_STYLE", "false")
        ).lower() in ["1", "true", "yes"]
        self.STORAGE_PUBLIC_URL = os.environ.get(
            "STORAGE_PUBLIC_URL",
            "https://pub-a9525ed8fd554c05ba42ef72c86b7063.r2.dev",
        )

        # 初始化 S3 客户端 (R2 兼容 S3 API)
        self.s3_client = None
        self._initialize_client()

    def _initialize_client(self):
        """初始化 S3 客户端"""
        try:
            self.s3_client = boto3.client(
                's3',
                endpoint_url=self.STORAGE_ENDPOINT,
                aws_access_key_id=self.STORAGE_ACCESS_KEY_ID,
                aws_secret_access_key=self.STORAGE_SECRET_ACCESS_KEY,
                region_name=self.STORAGE_REGION,
                config=boto3.session.Config(
                    s3={'force_path_style': self.STORAGE_FORCE_PATH_STYLE}
                )
            )
            logger.info("R2 客户端初始化成功")
        except Exception as e:
            logger.error(f"R2 客户端初始化失败: {e}")
            sys.exit(1)

    def _get_content_type(self, file_path):
        """获取文件的 MIME 类型"""
        mime_type, _ = mimetypes.guess_type(file_path)
        return mime_type or 'application/octet-stream'

    def upload_file(self, file_path, remote_name=None, folder="images"):
        """
        上传文件到 R2 存储

        Args:
            file_path (str): 本地文件路径
            remote_name (str): 远程文件名，如果为None则使用原文件名
            folder (str): 存储桶中的文件夹名称

        Returns:
            str: CDN URL 或 None（如果失败）
        """
        if not os.path.exists(file_path):
            logger.error(f"文件不存在: {file_path}")
            return None

        # 确定远程文件名
        if remote_name is None:
            remote_name = os.path.basename(file_path)

        # 构建完整的对象键
        object_key = f"{folder}/{remote_name}" if folder else remote_name

        try:
            # 获取文件内容类型
            content_type = self._get_content_type(file_path)

            # 上传文件
            logger.info(f"正在上传文件: {file_path} -> {object_key}")
            self.s3_client.upload_file(
                file_path,
                self.STORAGE_BUCKET_NAME,
                object_key,
                ExtraArgs={
                    'ContentType': content_type,
                    'CacheControl': 'public, max-age=31536000'  # 缓存一年
                }
            )

            # 生成 CDN URL
            cdn_url = f"{self.STORAGE_PUBLIC_URL}/{object_key}"
            logger.info(f"上传成功! CDN URL: {cdn_url}")

            return cdn_url

        except NoCredentialsError:
            logger.error("凭证错误，请检查访问密钥")
            return None
        except ClientError as e:
            logger.error(f"上传失败: {e}")
            return None
        except Exception as e:
            logger.error(f"上传过程中发生错误: {e}")
            return None

    def upload_directory(self, directory_path, folder="images", file_extensions=None):
        """
        上传目录中的所有文件

        Args:
            directory_path (str): 本地目录路径
            folder (str): 存储桶中的文件夹名称
            file_extensions (list): 允许上传的文件扩展名列表，如 ['.jpg', '.png', '.webp']

        Returns:
            dict: 文件名到 CDN URL 的映射字典
        """
        if not os.path.exists(directory_path):
            logger.error(f"目录不存在: {directory_path}")
            return {}

        if file_extensions is None:
            file_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf']

        uploaded_files = {}

        try:
            for filename in os.listdir(directory_path):
                file_path = os.path.join(directory_path, filename)

                # 检查是否为文件
                if not os.path.isfile(file_path):
                    continue

                # 检查文件扩展名
                file_ext = os.path.splitext(filename)[1].lower()
                if file_extensions and file_ext not in file_extensions:
                    logger.info(f"跳过非图片文件: {filename}")
                    continue

                # 上传文件
                cdn_url = self.upload_file(file_path, filename, folder)
                if cdn_url:
                    uploaded_files[filename] = cdn_url

            logger.info(f"目录上传完成，共上传 {len(uploaded_files)} 个文件")

        except Exception as e:
            logger.error(f"目录上传过程中发生错误: {e}")

        return uploaded_files

    def generate_markdown_replacement(self, uploaded_files, local_base_path="./images"):
        """
        生成 Markdown 文件中的图片链接替换字典

        Args:
            uploaded_files (dict): 文件名到 CDN URL 的映射
            local_base_path (str): 本地图片基础路径

        Returns:
            dict: 本地路径到 CDN URL 的替换字典
        """
        replacements = {}

        for filename, cdn_url in uploaded_files.items():
            local_path = f"{local_base_path}/{filename}"
            local_markdown = f"({local_path})"
            cdn_markdown = f"({cdn_url})"
            replacements[local_markdown] = cdn_markdown

        return replacements

    def list_bucket_objects(self, folder=None):
        """
        列出存储桶中的对象

        Args:
            folder (str): 文件夹名称，用于过滤特定文件夹的内容
        """
        try:
            prefix = f"{folder}/" if folder else ""

            response = self.s3_client.list_objects_v2(
                Bucket=self.STORAGE_BUCKET_NAME,
                Prefix=prefix
            )

            objects = response.get('Contents', [])

            if objects:
                logger.info(f"存储桶 '{self.STORAGE_BUCKET_NAME}' 中的对象:")
                for obj in objects:
                    object_key = obj['Key']
                    cdn_url = f"{self.STORAGE_PUBLIC_URL}/{object_key}"
                    size = obj['Size']
                    last_modified = obj['LastModified']
                    logger.info(f"  {object_key} - {size} bytes - {last_modified} - {cdn_url}")
            else:
                logger.info(f"存储桶 '{self.STORAGE_BUCKET_NAME}' 中没有找到对象")

        except ClientError as e:
            logger.error(f"列出对象失败: {e}")

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='Cloudflare R2 图片上传工具')
    parser.add_argument('path', help='要上传的文件或目录路径')
    parser.add_argument('--folder', default='images', help='R2中的文件夹名称 (默认: images)')
    parser.add_argument('--remote-name', help='远程文件名 (仅用于单文件上传)')
    parser.add_argument('--extensions', nargs='+', default=['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf'],
                       help='允许上传的文件扩展名 (默认: .jpg .jpeg .png .gif .webp .svg .pdf)')
    parser.add_argument('--list', action='store_true', help='列出存储桶中的所有对象')
    parser.add_argument('--replace-markdown', help='生成Markdown替换字典的本地文件路径')

    args = parser.parse_args()

    # 创建上传器实例
    uploader = R2Uploader()

    # 如果需要列出对象
    if args.list:
        uploader.list_bucket_objects(args.folder)
        return

    # 检查路径是否存在
    if not os.path.exists(args.path):
        logger.error(f"路径不存在: {args.path}")
        sys.exit(1)

    uploaded_files = {}

    # 判断是文件还是目录
    if os.path.isfile(args.path):
        # 上传单个文件
        logger.info("开始上传单个文件...")
        cdn_url = uploader.upload_file(args.path, args.remote_name, args.folder)
        if cdn_url:
            filename = args.remote_name or os.path.basename(args.path)
            uploaded_files[filename] = cdn_url
    else:
        # 上传目录
        logger.info("开始上传目录...")
        uploaded_files = uploader.upload_directory(args.path, args.folder, args.extensions)

    if uploaded_files:
        logger.info("\n上传成功! 文件列表:")
        for filename, cdn_url in uploaded_files.items():
            logger.info(f"  {filename} -> {cdn_url}")

        # 生成 Markdown 替换字典
        if args.replace_markdown:
            replacements = uploader.generate_markdown_replacement(uploaded_files, args.replace_markdown)
            logger.info("\nMarkdown 替换字典:")
            for local_path, cdn_url in replacements.items():
                logger.info(f"  {local_path} -> {cdn_url}")
    else:
        logger.error("没有文件上传成功")

if __name__ == "__main__":
    main()
