// sheetsrouter.cjs
const express = require('express');
const router = express.Router();
const getSheetsService = require('./getsheetsservice.cjs');

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_TAB = "Sheet1"; // Match the tab name in your spreadsheet
const SHEET_RANGE = `${SHEET_TAB}!A2:J`;

// POST /api/add-row
router.post('/add-row', async (req, res) => {
  try {
    const sheets = await getSheetsService();

    const {
      Name,
      MobileNumber,
      CarNumber,
      CNGKitNumber,
      CNGKitModelNa,
      FittingDate,
      LastServiceDate,
      serviceDate,
      testingDate
    } = req.body;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          Name,
          MobileNumber,
          CarNumber,
          CNGKitNumber,
          CNGKitModelNa,
          FittingDate,
          LastServiceDate,
          serviceDate,
          testingDate
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
      range: SHEET_RANGE
    });

    const rows = result.data.values || [];

    const matchedCars = rows.map((row, index) => ({
      Name: row[0] || '',
      MobileNumber: row[1] || '',
      CarNumber: row[2] || '',
      CNGKitNumber: row[3] || '',
      CNGKitModelNa: row[4] || '',
      FittingDate: row[5] || '',
      LastServiceDate: row[6] || '',
      serviceDate: row[7] || '',
      testingDate: row[8] || '',
      rowNumber: index + 2 // Account for header row
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
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // Assuming it's the first sheet (Sheet1)
                dimension: 'ROWS',
                startIndex: rowNumber - 1,
                endIndex: rowNumber
              }
            }
          }
        ]
      }
    });

    res.status(200).json({ message: 'Row deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting car:', err);
    res.status(500).json({ error: 'Failed to delete car' });
  }
});

module.exports = router;
