function readFlag(name: string): string | undefined {
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (inline) {
    return inline.slice(name.length + 1);
  }

  const index = process.argv.indexOf(name);
  if (index !== -1) {
    return process.argv[index + 1];
  }

  return undefined;
}

const dryRun = process.argv.includes('--dry-run');
const baseUrl = readFlag('--base-url');

async function main() {
  if (baseUrl) {
    process.env.NEXT_PUBLIC_BASE_URL = baseUrl;
  }

  const { getIndexNowPayload, submitIndexNowUrls, INDEXNOW_ENDPOINT } =
    await import('../src/lib/seo/indexnow');

  if (dryRun) {
    const payload = await getIndexNowPayload();
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          endpoint: INDEXNOW_ENDPOINT,
          host: payload.host,
          keyLocation: payload.keyLocation,
          urlCount: payload.urlList.length,
          urlList: payload.urlList,
        },
        null,
        2
      )
    );
    return;
  }

  const result = await submitIndexNowUrls();

  console.log(
    JSON.stringify(
      {
        endpoint: INDEXNOW_ENDPOINT,
        status: result.status,
        ok: result.ok,
        keyLocation: result.payload.keyLocation,
        urlCount: result.payload.urlList.length,
        urlList: result.payload.urlList,
        responseText: result.responseText,
      },
      null,
      2
    )
  );

  if (!result.ok) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
