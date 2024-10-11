function fetchAndFilterJapaneseData() {
  // 正しいraw.githubusercontent.comのURLを使用
  var url = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/loc.json';
  
  // 外部リソースからJSONデータを取得
  var response = UrlFetchApp.fetch(url);
  
  // JSONデータをパース
  var jsonData = JSON.parse(response.getContentText());

  // "ja" のデータを取得
  var japaneseData = jsonData['ja'];

  // スプレッドシートと特定のシートを開く
  var spreadsheetId = SPREADSHEET_ID; // スプレッドシートのID
  var sheetName = 'honyaku';  // 対象のシート名に変更
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId); // スプレッドシートを開く
  var sheet = spreadsheet.getSheetByName(sheetName); // シート名を使ってシートを取得
  
  if (sheet === null) {
    Logger.log('指定されたシート名が見つかりません: ' + sheetName);
    return;
  }

  sheet.clear(); // 既存のデータをクリア
  sheet.appendRow(['ID', '日本語の名前']); // ヘッダー行を追加

  // "ja" の中にあるIDと名前を取得
  for (var id in japaneseData) {
    if (japaneseData.hasOwnProperty(id)) {
      var name = japaneseData[id];  // 日本語の名前を取得
      // ID (id) と 日本語の名前 (name) をスプレッドシートに書き込む
      sheet.appendRow([id, name]);
    }
  }
}


