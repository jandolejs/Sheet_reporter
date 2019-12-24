/* HomeLED

Examples:
https://script.google.com/macros/s/AKfycbzZJqzfHHpzittJzD1cldv_hNi8MjEVtUOplIXUWumCO2kKvd91/exec
https://script.google.com/macros/s/AKfycbzZJqzfHHpzittJzD1cldv_hNi8MjEVtUOplIXUWumCO2kKvd91/exec?type=1&note=ping&proj=homeled
https://script.google.com/macros/s/AKfycbzZJqzfHHpzittJzD1cldv_hNi8MjEVtUOplIXUWumCO2kKvd91/exec?type=-1&proj=browser&note=test,%20zkouška&

Device list:
    tester - using for testing for now

Error list:
    #auth_error - you must use some device name .../exec?proj="String"
    #template_missing - there is no template for this file
 */

var Spreadsheet_ID = "1aEbCdOxYq2LalEMmNKb_MugKUkqUBYi9fSOhFC0cofM";
var Possible_projs = ["Tester", "MyMain"];
var Sheet_newLine  = 4;

var Control_devName_col = 1; // column where device name is stored
var Control_active_col  = 2; // column where - is device active?
var Control_logPing_col = 3; // column where logg ping setting is

var Log_date_col = 1;
var Log_devName_col = 2;
var Log_parameters_col = 3;

var Stat_active_last    = 4; // column when device was last active
var Stat_room_temp      = 5;
var Stat_room_light     = 6;
var Stat_room_door      = 7;
var Stat_room_window    = 8;
var Stat_room_movement  = 9;

var MyMain_name = "MyMain";
var MyMain_row = 10;

var Tester_name = "Tester";
var Tester_row = 12;


function doGet(e) {

    console.info(e);

    if (e == undefined) {e = {}; e.parameters = {proj:Tester_name, type:"-1", note:"TESTING-doGet", runtime:"12345"}; }
    if (!e.parameters.proj) return ContentService.createTextOutput("0 - #auth_error");

    return ContentService.createTextOutput(save(e));
}

function save(e) {

    if (e == undefined) {e = {}; e.parameters = {proj:Tester_name, type:"-1", note:"TESTING-save", runtime:"12345"}; }
    var ss = SpreadsheetApp.openById(Spreadsheet_ID);

    var proj = e.parameters.proj;
    var type = e.parameters.type;
    var note = e.parameters.note;

    var sd = findSheet(ss, proj);
    var sl = findSheet(ss, "Log");
    var sc = findSheet(ss, "Control");

    newRecord(sl, e);
}

function newRecord(sh, e) {

    var sheet_name = sh.getSheetName();

    switch (sheet_name) { // write acording to sheet

        case "Control":
        break;

        case "Log":
            sh.insertRowBefore(Sheet_newLine);
            sh.getRange(Sheet_newLine, Log_date_col).setValue(new Date());
            sh.getRange(Sheet_newLine, Log_devName_col).setValue(e.parameters.proj);
            sh.getRange(Sheet_newLine, Log_parameters_col).setValue(e.queryString);
        break;

        case Tester_name:
        break;

        case MyMain_name:
        break;

        default:
        break;
    }

}

function findSheet(ss, Sheet_name) {

    var sh = ss.getSheetByName(Sheet_name);
    if (!sh) {
        sh = ss.insertSheet();
        sh.setName(Sheet_name);
        sh.setFrozenRows(3);
    }

    useTemplate(sh); // regenerate sheet !todo: only for new file, add to menu
    return sh;
}

function useTemplate(sh) {

    sh.getRange("A1").setValue("Name:");
    var sheet_name = sh.getSheetName();

    switch (sheet_name) { // use template for known sheets

        case "Control":
            sh.getRange("B1").setValue("Control");
            sh.getRange(3, Control_devName_col).setValue("Device name");
            sh.getRange(3, Control_active_col).setValue("Active");
            sh.getRange(3, Control_logPing_col).setValue("Log Ping");
            sh.getRange(3, Stat_active_last).setValue("Last active");
        break;

        case "Log":
            sh.getRange("B1").setValue("Log");
            sh.getRange(3, Log_date_col).setValue("Date");
            sh.getRange(3, Log_devName_col).setValue("Device");
            sh.getRange(3, Log_parameters_col).setValue("Parameters");
        break;

        case Tester_name:
            sh.getRange("B1").setValue("Testing sheet");
            sh.getRange(3, )
        break;

        case MyMain_name:
            sh.getRange("B1").setValue("My room");
        break;

        default:
            sh.getRange("B1").setValue("#template_missing");
        break;
    }
}

