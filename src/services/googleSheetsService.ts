import { LearnerProfile, UserGameState } from '../types/induction';

export interface SyncedLearnerRecord {
  timestamp: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  regional: string;
  centroFormacion: string;
  programaFormacion: string;
  numeroFicha: string;
  modalidad: string;
  isVocero: string;
  completedModules: string;
  evaluationScore: string;
  status: string;
  certificateCode: string;
  xp: string;
  rowIndex?: number;
}

export interface SpreadsheetInfo {
  id: string;
  name: string;
  url: string;
  createdNow?: boolean;
}

const DEFAULT_SHEET_TITLE = 'SENA - Registro Oficial de Inducción (Acuerdo 009 de 2024)';
const TAB_NAME = 'Aprendices Inducción';

export const SHEET_HEADERS = [
  'Fecha y Hora de Registro',
  'Nombres y Apellidos',
  'Tipo Documento',
  'Número Documento',
  'Regional SENA',
  'Centro de Formación',
  'Programa de Formación',
  'No. Ficha Caracterización',
  'Modalidad',
  'Postulado a Vocero',
  'Módulos Completados',
  'Calificación Evaluación',
  'Estado de Inducción',
  'Código Certificado Oficial',
  'Puntos XP',
];

/**
 * Searches for an existing induction spreadsheet or creates a new one in Google Drive.
 */
export const findOrCreateInductionSpreadsheet = async (
  token: string
): Promise<SpreadsheetInfo> => {
  // 1. Search in Drive
  const q = encodeURIComponent(
    `name = '${DEFAULT_SHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!searchRes.ok) {
    const err = await searchRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error al buscar archivos en Google Drive');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    const existing = searchData.files[0];
    return {
      id: existing.id,
      name: existing.name,
      url: existing.webViewLink || `https://docs.google.com/spreadsheets/d/${existing.id}`,
      createdNow: false,
    };
  }

  // 2. Create a new Spreadsheet with the official headers and institutional SENA styling
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: DEFAULT_SHEET_TITLE,
      },
      sheets: [
        {
          properties: {
            title: TAB_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error al crear la hoja de cálculo en Google Sheets');
  }

  const newSheet = await createRes.json();
  const spreadsheetId = newSheet.spreadsheetId;

  // 3. Write and format headers with SENA Green (#39A900)
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${TAB_NAME}'!A1:O1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [SHEET_HEADERS],
      }),
    }
  );

  // Apply styling (green header background #39A900, bold white text)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: newSheet.sheets[0]?.properties?.sheetId || 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: SHEET_HEADERS.length,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 57 / 255, green: 169 / 255, blue: 0 / 255 }, // SENA Green #39A900
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: newSheet.sheets[0]?.properties?.sheetId || 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: SHEET_HEADERS.length,
              },
            },
          },
        ],
      }),
    });
  } catch (styleErr) {
    console.warn('No se pudo aplicar el formato estético inicial:', styleErr);
  }

  return {
    id: spreadsheetId,
    name: DEFAULT_SHEET_TITLE,
    url: newSheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    createdNow: true,
  };
};

/**
 * Reads all rows from the spreadsheet.
 */
export const fetchLearnerRecords = async (
  token: string,
  spreadsheetId: string
): Promise<SyncedLearnerRecord[]> => {
  const range = encodeURIComponent(`'${TAB_NAME}'!A2:O`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error al leer datos de la hoja de cálculo');
  }

  const data = await res.json();
  const rows = data.values || [];

  return rows.map((row: string[], index: number) => ({
    rowIndex: index + 2, // 1-based index, row 1 is header
    timestamp: row[0] || '',
    fullName: row[1] || '',
    documentType: row[2] || '',
    documentNumber: row[3] || '',
    regional: row[4] || '',
    centroFormacion: row[5] || '',
    programaFormacion: row[6] || '',
    numeroFicha: row[7] || '',
    modalidad: row[8] || '',
    isVocero: row[9] || '',
    completedModules: row[10] || '',
    evaluationScore: row[11] || '',
    status: row[12] || '',
    certificateCode: row[13] || '',
    xp: row[14] || '',
  }));
};

/**
 * Saves or updates an apprentice's record in the Google Spreadsheet.
 */
export const syncLearnerToSheet = async (
  token: string,
  spreadsheetId: string,
  learner: LearnerProfile,
  gameState: UserGameState
): Promise<{ action: 'created' | 'updated'; rowNumber: number }> => {
  const existingRecords = await fetchLearnerRecords(token, spreadsheetId);

  // Check if this apprentice already has an entry (matching document number & ficha)
  const existing = existingRecords.find(
    (r) =>
      r.documentNumber.trim() === learner.documentNumber.trim() &&
      r.numeroFicha.trim() === learner.numeroFicha.trim()
  );

  const nowFormatted = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date());

  const statusText = gameState.evaluationCompleted
    ? `Certificado Aprobado (${gameState.evaluationScore}%)`
    : gameState.completedModules.length === 5
    ? 'Pendiente Evaluación Final'
    : `En Curso (${gameState.completedModules.length}/5 Módulos)`;

  // Hash-based certificate code
  const hash = Math.abs(
    (learner.documentNumber + learner.numeroFicha).split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0)
  )
    .toString(36)
    .toUpperCase()
    .padStart(6, 'X')
    .slice(0, 6);

  const certCode = gameState.evaluationCompleted ? `SENA-IND-2024-${hash}` : 'Pendiente';

  const rowValues = [
    nowFormatted,
    learner.fullName,
    learner.documentType,
    learner.documentNumber,
    learner.regional,
    learner.centroFormacion,
    learner.programaFormacion,
    learner.numeroFicha,
    learner.modalidad,
    learner.isVoceroCandidate ? 'Sí' : 'No',
    `${gameState.completedModules.length} de 5`,
    gameState.evaluationCompleted ? `${gameState.evaluationScore}%` : 'No presentada',
    statusText,
    certCode,
    `${gameState.xp} XP`,
  ];

  if (existing && existing.rowIndex) {
    // Update existing row
    const targetRange = `'${TAB_NAME}'!A${existing.rowIndex}:O${existing.rowIndex}`;
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        targetRange
      )}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Error al actualizar registro en la hoja');
    }

    return { action: 'updated', rowNumber: existing.rowIndex };
  } else {
    // Append new row
    const appendRange = `'${TAB_NAME}'!A:O`;
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        appendRange
      )}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );

    if (!appendRes.ok) {
      const err = await appendRes.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Error al agregar registro en la hoja');
    }

    return { action: 'created', rowNumber: existingRecords.length + 2 };
  }
};
