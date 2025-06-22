const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const getSheetsService = async () => {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

  const auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  return sheets;
};

module.exports = getSheetsService;
