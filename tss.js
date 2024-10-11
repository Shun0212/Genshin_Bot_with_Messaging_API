function writeToSheet(sheetId, text, id,score) {
  const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
  const currentTime = new Date();
  
  const row = [
    currentTime,
    id,
    text[1] || "",
    text[2] || "",
    text[3] || "",
    text[4] || "",
    score
  ];

  sheet.appendRow(row);
}

// テスト
function testWriteToSheet() {
  const sheetId = SPREADSHEET_ID; // あなたのスプレッドシートのIDを指定
  const textToWrite = ["テキスト1", "テキスト2", "テキスト3"];
  const idToWrite = "123456789"; // 例としてIDを指定

  writeToSheet(sheetId, textToWrite, idToWrite);
}
