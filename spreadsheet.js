function getSheet(name){
  const sheet = SpreadsheetApp.getActiveSheet();

  if (sheet.getName() == name){
    return sheet
  }else{
    const active = SpreadsheetApp.getActive(); 
    if (active){
      return active.getSheetByName(name);
    }else{
      return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name)
    }
  }
}

function getLastData(name) {
  return getSheet(name).getDataRange().getValues().length;
}

function RecordGenshinData(row,genshinID){
  getSheet('genshin').getRange(row, 1).setValue(genshinID);

}

function myfunc(){
  RecordGenshinData(2,879162832);
}


