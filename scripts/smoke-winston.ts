import dotenv from 'dotenv';
import { detectAIContent } from '../src/lib/winston';

dotenv.config();

const MIN_TEXT_LENGTH = 300;

const DEFAULT_SMOKE_TEXT = [
  'En los ultimos meses, muchas universidades y equipos editoriales han empezado a revisar con mas cuidado si un texto fue escrito por una persona o generado por una herramienta automatica.',
  'Esta muestra existe solo para una verificacion tecnica de integracion real y no pretende representar una pieza editorial completa ni un contenido optimizado para produccion.',
  'Su objetivo es superar el minimo de caracteres exigido por el servicio, ejecutar una llamada autentica y confirmar que las credenciales, la conectividad y el parseo del resultado siguen funcionando correctamente dentro del repositorio.',
].join(' ');

function readInputText(): string {
  const cliText = process.argv.slice(2).join(' ').trim();

  if (cliText.length > 0) {
    return cliText;
  }

  return process.env.WINSTON_SMOKE_TEXT?.trim() || DEFAULT_SMOKE_TEXT;
}

function fail(message: string, details?: string): never {
  console.error(`[smoke:winston] ${message}`);

  if (details) {
    console.error(details);
  }

  process.exit(1);
}

async function main() {
  if (!process.env.WINSTON_API_KEY) {
    fail('Missing WINSTON_API_KEY.');
  }

  const text = readInputText();

  if (text.length < MIN_TEXT_LENGTH) {
    fail(
      `Input text must be at least ${MIN_TEXT_LENGTH} characters.`,
      `Current length: ${text.length}`
    );
  }

  console.log(
    `[smoke:winston] Running live detection with ${text.length} characters...`
  );

  try {
    const result = await detectAIContent({ text });

    if (
      typeof result.score !== 'number' ||
      !Number.isFinite(result.score) ||
      !Array.isArray(result.sentences)
    ) {
      fail(
        'Unexpected response payload from Winston detection.',
        JSON.stringify(result, null, 2)
      );
    }

    console.log(
      JSON.stringify(
        {
          score: result.score,
          version: result.version ?? null,
          language: result.language ?? null,
          sentences: result.sentences.length,
          credits_used: result.credits_used ?? null,
          credits_remaining: result.credits_remaining ?? null,
        },
        null,
        2
      )
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.stack || error.message : String(error);
    fail('Live Winston detection failed.', message);
  }
}

void main();
