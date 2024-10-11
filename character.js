function fetchCharacterData() {
  // Enka Network characters.json の URL
  var url = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json';
  
  // JSONデータを取得
  var response = UrlFetchApp.fetch(url);
  
  // 取得したデータをパース
  var characterData = JSON.parse(response.getContentText());

  // GoogleスプレッドシートのIDとシート名を指定
  var spreadsheetId = SPREADSHEET_ID;  // スプレッドシートのIDを指定
  var sheetName = 'character';  // シート名
  
  // スプレッドシートとシートを取得
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log('指定されたシート名が見つかりません: ' + sheetName);
    return "シートが見つかりません";
  }

  // シートをクリアして、新しいデータを書き込む準備
  sheet.clear();
  sheet.appendRow(['キャラクターID', '名前', 'サイドアイコン名']); // ヘッダー行を追加

  // データをスプレッドシートに書き込む
  for (var characterId in characterData) {
    if (characterData.hasOwnProperty(characterId)) {
      var characterInfo = characterData[characterId];
      var name = characterInfo.NameTextMapHash || '不明';
      var sideIconName = characterInfo.SideIconName || '不明';

      // スプレッドシートにID、名前、サイドアイコン名を書き込む
      sheet.appendRow([characterId, name, sideIconName]);
    }
  }
  
  Logger.log('データ書き込み完了');
}


