/* HomeLED

https://script.google.com/macros/s/AKfycbzZJqzfHHpzittJzD1cldv_hNi8MjEVtUOplIXUWumCO2kKvd91/exec
https://script.google.com/macros/s/AKfycbzZJqzfHHpzittJzD1cldv_hNi8MjEVtUOplIXUWumCO2kKvd91/exec?type=1&note=ping&proj=homeled
https://script.google.com/macros/s/AKfycbzZJqzfHHpzittJzD1cldv_hNi8MjEVtUOplIXUWumCO2kKvd91/exec?type=-1&proj=browser&note=test,%20zkouška&

 */

var Sheet_ID = "1aEbCdOxYq2LalEMmNKb_MugKUkqUBYi9fSOhFC0cofM"
var ss = SpreadsheetApp.openById(Sheet_ID);

function doGet(e) {

    console.info(e);

    if (e == undefined) {e = {}; e.parameters = {proj:"editor", type:"-1", note:"TEST"}; }
    if (!e.parameters.proj) return ContentService.createTextOutput("0 - unauthorized - use some device name (?proj=name)");

    var saved = save(e);

    if (e.parameter.proj == "GardenJ") {return ContentService.createTextOutput(SpreadsheetApp.openById(Sheet_ID).getSheetByName("GardenJ").getRange("I3").getValue()); }
    if (e.parameter.proj ==  "HomeR" ) {return ContentService.createTextOutput(SpreadsheetApp.openById(Sheet_ID).getSheetByName( "HomeR" ).getRange("I3").getValue()); }

    return ContentService.createTextOutput(saved);
}

function save(e) {

    var  row  = 4; // číslo nového řádku
    var time = new Date();

    var proj = e.parameter.proj;
    var type = e.parameter.type;
    var note = e.parameter.note;
    var temp = e.parameter.temp;
    var humi = e.parameter.humi;

 // Get sheets
    var sh = ss.getSheetByName( proj ); // sheet
    var sl = ss.getSheetByName( "Logg" ); // log
    var sa = ss.getSheetByName( "Archiv" ); // archive

 // Create new if not found
    if ( !sh ) { sh = newSheet( proj ); }
    if ( !sl ) { sl = newSheet( "Logg" ); }
    if ( !sa ) { sa = newSheet( "Archiv" ); }

 // Log request
    sl.insertRowBefore(row);
    sl.getRange("A"+row).setValue(time);
    sl.getRange("B"+row).setValue(e.queryString);

 // Dont write init or ping
    if (type == "init") return true;
    if (note == "ping" && sh.getRange("J3").getValue() != "Yes") return true;

 // Delete values older than 24h
    var _interval = sh.getRange("I3").getValue();
    deleteOld(sh, _interval);

 // Write to Sheet (proj)                   // Also write to archive
    sh.insertRowBefore(row);                    sa.insertRowBefore(row);
    sh.getRange("D1").setValue(time);          sa.getRange("D1").setValue(time);
    sh.getRange("A"+row).setValue(time);       sa.getRange("A"+row).setValue(time);
    sh.getRange("B"+row).setValue(type);       sa.getRange("B"+row).setValue(type);
    sh.getRange("C"+row).setValue(note);       sa.getRange("C"+row).setValue(note);
    sh.getRange("D"+row).setValue(proj);       sa.getRange("D"+row).setValue(proj);
    sh.getRange("E"+row).setValue("=(A4-A5)");
    sh.getRange("F"+row).setValue(humi);       sa.getRange("F"+row).setValue(humi);
    sh.getRange("G"+row).setValue(temp);       sa.getRange("G"+row).setValue(temp);

    return true;
}

function newSheet(Sheet_name) {

    _newSheet = ss.insertSheet();
    _newSheet.setName(Sheet_name);

    _newSheet.getRange("A1").setValue("Device name:");
    _newSheet.getRange("B1").setValue(  Sheet_name  );
    _newSheet.getRange("C1").setValue("Last entry:" );

    _newSheet.getRange("A2").setValue("Since last seen:");
    _newSheet.getRange("B2").setValue( "=((NOW())-D1)"  );

    _newSheet.getRange("A3").setValue("Time");
    _newSheet.getRange("B3").setValue("Type");
    _newSheet.getRange("C3").setValue( "Message" );
    _newSheet.getRange("D3").setValue("Device ID");
    _newSheet.getRange("E3").setValue( "Delayed" );
    _newSheet.getRange("F3").setValue("Humi");
    _newSheet.getRange("G3").setValue("Temp");

    _newSheet.getRange("I1").setValue("Setting");
        _newSheet.getRange("I2").setValue("Interval [sec]");
        _newSheet.getRange("I3").setValue("60");
    _newSheet.getRange("J1").setValue("Setting");
        _newSheet.getRange("J2").setValue("Log ping");
        _newSheet.getRange("J3").setValue("1");

    return _newSheet;
}

function deleteOld(sheet, interval) {
    try{
        if (sheet.getMaxRows() < 14) return;
        var count = sheet.getMaxRows();
        lastRow = (1440/(interval/60));
        sheet.deleteRows(lastRow, count - lastRow);
        sheet.getRange("E" + (sheet.getMaxRows()-1)).setValue(" ");
    } catch (err){}
}
