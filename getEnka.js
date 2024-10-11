function getuserData(genshinID) {
  const genshinURL = `https://enka.network/api/uid/${genshinID}`;

  try {
    const response = UrlFetchApp.fetch(genshinURL);
    
    // Check if the response status is OK (200)
    if (response.getResponseCode() === 200) {
      return JSON.parse(response.getContentText());
    } else {
      console.error(`Error: Received a non-OK response. Status Code: ${response.getResponseCode()}`);
      return null;
    }
  } catch (error) {
    console.error(`Error: ${error}`);
    return null;
  }
}

function fetchCharacterData() {
  // Enka Network characters.json の URL
  var url = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json';
  
  // JSONデータを取得
  var response = UrlFetchApp.fetch(url);
  
  // 取得したデータをパース
  var characterData = JSON.parse(response.getContentText());

  // GoogleスプレッドシートのIDとシート名を指定
  var spreadsheetId = 'YOUR_SPREADSHEET_ID';  // スプレッドシートのIDを指定
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

function extractPlayerInfo(genshinID) {
  var jsonData = getuserData(genshinID);

  if (jsonData) {
    var playerInfo = jsonData.playerInfo;
    var nickname = playerInfo.nickname;
    var level = playerInfo.level;
    var worldLevel = playerInfo.worldLevel;
    var profilechara = findTranslationById(extractNamePart(extractAvatarId(jsonData, 1)));

    return `ニックネーム:${nickname}\n プレイヤーレベル:${level}\n 世界レベル:${worldLevel}\nプロフィール:${profilechara}`;
  } else {
    return "データの取得に失敗しました。";
  }
}

function extractIconPart(characterId) {
  // スプレッドシートのIDとシート名を指定
  var spreadsheetId = SPREADSHEET_ID;  // 実際のスプレッドシートIDに置き換えてください
  var sheetName = 'character';  // シート名を指定

  // スプレッドシートとシートを取得
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log('指定されたシート名が見つかりません: ' + sheetName);
    return null;  // シートが見つからない場合
  }

  // スプレッドシートのデータを取得（2D配列）
  var data = sheet.getDataRange().getValues();

  // キャラクターIDの行を検索し、サイドアイコン名を取得
  for (var i = 1; i < data.length; i++) {  // 1行目はヘッダー行なのでスキップ
    if (data[i][0] == characterId) {  // 1列目にキャラクターIDがあると仮定
      var sideIconName = data[i][2];  // 3列目にSideIconNameがあると仮定
      if (sideIconName) {
        const iconPart = sideIconName.split("UI_AvatarIcon_Side_")[1];
        return `UI_AvatarIcon_${iconPart}`;
      } else {
        Logger.log(`サイドアイコン名が見つかりません (ID: ${characterId})`);
        return null;  // サイドアイコン名がない場合
      }
    }
  }

  Logger.log(`キャラクターID ${characterId} が見つかりませんでした。`);
  return null;  // 該当するキャラクターIDが見つからない場合
}

function extractNamePart(characterId) {
  // スプレッドシートのIDとシート名を指定
  var spreadsheetId = SPREADSHEET_ID; // 実際のスプレッドシートIDに置き換えてください
  var sheetName = 'character';  // シート名を指定

  // スプレッドシートとシートを取得
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log('指定されたシート名が見つかりません: ' + sheetName);
    return null; // シートが見つからない場合
  }

  // スプレッドシートのデータを取得（2D配列）
  var data = sheet.getDataRange().getValues();

  // キャラクターIDの行を検索
  for (var i = 1; i < data.length; i++) { // 1行目はヘッダー行なのでスキップ
    if (data[i][0] == characterId) { // 1列目にキャラクターIDがあると仮定
      return data[i][1]; // 2列目がNameTextMapHashだと仮定
    }
  }

  Logger.log(`キャラクターID ${characterId} が見つかりませんでした。`);
  return null; // 該当するキャラクターIDが見つからない場合
}


function extractPictURL(genshinID, num) {
  var jsonData = getuserData(genshinID);

  if (jsonData) {
    var characterId = extractAvatarId(jsonData, num);
    var pict = extractIconPart(characterId);

    return `https://enka.network/ui/${pict}.png`;
  } else {
    return "データの取得に失敗しました。";
  }
}


function extractAvatarId(jsonData, num) {
  // 必要なデータが存在するか確認
  if (jsonData && jsonData.playerInfo && jsonData.playerInfo.showAvatarInfoList && jsonData.playerInfo.showAvatarInfoList.length > 0) {
    // 指定したインデックスが範囲内か確認
    if (num < jsonData.playerInfo.showAvatarInfoList.length) {
      const avatarId = jsonData.playerInfo.showAvatarInfoList[num].avatarId;
      return avatarId;
    } else {
      console.error(`指定されたインデックスが範囲外です。インデックス: ${num}, リスト長さ: ${jsonData.playerInfo.showAvatarInfoList.length}`);
      return null;
    }
  } else {
    console.error("プレイヤーデータに必要な情報が見つかりません");
    return null;
  }
}


function findTranslationById(id) {
  // スプレッドシートのIDとシート名を指定
  var spreadsheetId = SPREADSHEET_ID
  var sheetName = 'honyaku';  // シート名を指定
  
  // スプレッドシートとシートを取得
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log('指定されたシート名が見つかりません: ' + sheetName);
    return "シートが見つかりません";
  }

  // シート内のすべてのデータを取得（2D配列）
  var data = sheet.getDataRange().getValues();

  // データの検索（1列目がID、2列目が日本語訳）
  for (var i = 1; i < data.length; i++) { // 1行目はヘッダー行のためスキップ
    if (data[i][0] == id) { // 1列目（ID列）と一致するか
      return data[i][1]; // 2列目（日本語訳）を返す
    }
  }

  // IDが見つからない場合
  return "対応する日本語訳がありません";
}




function findIdByTranslation(translation) {
  // スプレッドシートのIDとシート名を指定
  var spreadsheetId = SPREADSHEET_ID;  // スプレッドシートのID
  var sheetName = 'honyaku';  // シート名を指定
  
  // スプレッドシートとシートを取得
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log('指定されたシート名が見つかりません: ' + sheetName);
    return "シートが見つかりません";
  }

  // シート内のすべてのデータを取得（2D配列）
  var data = sheet.getDataRange().getValues();

  // データの検索（1列目がID、2列目が日本語訳）
  for (var i = 1; i < data.length; i++) { // 1行目はヘッダー行のためスキップ
    if (data[i][1] == translation) { // 2列目（日本語訳列）と一致するか
      return data[i][0]; // 1列目（ID）を返す
    }
  }

  // 対応するIDが見つからない場合
  return "対応するIDがありません";
}


function getOnlyName(genshinID) {
  var jsonData = getuserData(genshinID);

  if (jsonData) {
    var jsonObject;
    try {
      jsonObject = JSON.parse(jsonData);
    } catch (error) {
      console.error("JSONデータのパースエラー:", error);
      return "エラーが発生しました。";
    }

    var playerInfo = jsonObject.playerInfo;
    var nickname = playerInfo.nickname;
    return nickname;
  } else {
    return "データの取得に失敗しました。";
  }
}


function test(){

  const data = getuserData(879162832);
  console.log(extractAvatarId(data,2));
  console.log(extractNamePart(extractAvatarId(data,2)));
  console.log( extractPictURL(879162832, 3) );
  console.log(findTranslationById(extractNamePart(extractAvatarId(getuserData(879162832),1))));
}



function test2(){
  console.log(whereWantScore(879162832,"アルハイゼン"));
}


function whereWantScore(genshinID, genshinName) {
  const jsonData = getuserData(genshinID);
  if (!jsonData) {
    console.error("プレイヤーデータが取得できませんでした。");
    return "データがありません";
  }

  var charactername = findIdByTranslation(genshinName);
  
  for (var v = 0; v < jsonData.playerInfo.showAvatarInfoList.length; v++) {
    var chara = extractAvatarId(jsonData, v);
    if (!chara) continue;  // アバターが取得できない場合はスキップ

    var charaNameID = extractNamePart(chara);
    
    if (charactername == charaNameID) {
      return v;
    }
  }

  return "指定されたキャラクターが見つかりません。";
}








