const express = require('express');
const router = express.Router();
const getSheetsService = require('./getsheetsservice.cjs');

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME ="Cars"; // change if your sheet tab is named differently

// POST /api/add-row
router.post('/add-row', async (req, res) => {
  try {
    const sheets = await getSheetsService();

    const {
      Name,
      MobileNumber,
      carNumber,
      cngKitNumber,
      cngKitModelName,
      fittingDate,
      lastServiceDate,
      nextServiceDate,
      testingDate
    } = req.body;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:J`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          Name,
          MobileNumber,
          carNumber,
          cngKitNumber,
          cngKitModelName,
          fittingDate,
          lastServiceDate,
          nextServiceDate,
          testingDate,
          new Date().toLocaleString() // optional timestamp
        ]]
      }
    });

    res.status(200).json({ message: 'Row added successfully' });
  } catch (err) {
    console.error('❌ Error adding row:', err);
    res.status(500).json({ error: 'Failed to add row' });
  }
});

// GET /api/cars?mobile=xxxxxxxxxx
router.get('/cars', async (req, res) => {
  try {
    const mobile = req.query.mobile;
    if (!mobile) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    const sheets = await getSheetsService();
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:J`
    });

    const rows = result.data.values || [];

    const matchedCars = rows.map((row, index) => ({
      Name: row[0] || '',
      MobileNumber: row[1] || '',
      carNumber: row[2] || '',
      cngKitNumber: row[3] || '',
      cngKitModelName: row[4] || '',
      fittingDate: row[5] || '',
      lastServiceDate: row[6] || '',
      nextServiceDate: row[7] || '',
      testingDate: row[8] || '',
      rowNumber: index + 2 // for deleting (1-based index + header row)
    })).filter(car => car.MobileNumber === mobile);

    res.status(200).json(matchedCars);
  } catch (err) {
    console.error('❌ Error fetching cars:', err);
    res.status(500).json({ error: 'Failed to fetch car data' });
  }
});

// DELETE /api/cars/:rowNumber
router.delete('/cars/:rowNumber', async (req, res) => {
  try {
    const rowNumber = parseInt(req.params.rowNumber);
    if (isNaN(rowNumber)) {
      return res.status(400).json({ error: 'Invalid row number' });
    }

    const sheets = await getSheetsService();

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // ⚠️ usually Sheet1 is 0 — change if yours differs
              dimension: 'ROWS',
              startIndex: rowNumber - 1,
              endIndex: rowNumber
            }
          }
        }]
      }
    });

    res.status(200).json({ message: 'Row deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting car:', err);
    res.status(500).json({ error: 'Failed to delete car' });
  }
});

module.exports = router;
