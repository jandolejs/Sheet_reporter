#include <Wire.h>
#include <EEPROM.h>
#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <WiFiManager.h>

#include <ESP8266WebServer.h>
WiFiServer server(80);

#include "DHTesp.h"
DHTesp dht;

String header;
#include "HTTPSRedirect.h"
HTTPSRedirect* client = nullptr;
const char* GScriptId = "AKfycbzZJqzfHHpzittJzD1cldv_hNi8MjEVtUOplIXUWumCO2kKvd91";

#define wifi_connect WiFiManager wifiManager; wifiManager.setConfigPortalTimeout(50); wifiManager.autoConnect("Honzovo")

#define prom_interval 10

// #define G_var_proj "HomeJ"
// #define G_var_proj "GardenJ"
// #define G_var_proj "HomeR"
// #define G_var_proj "GardenR"

String
    G_var_note, G_var_type,
    Weather_humidity, Weather_temp;

uint32_t
    Main_interval;



void sleepNow() {
    Serial.print("\nGoing to sleep for: " + String(Main_interval));
    ESP.deepSleep(Main_interval*1000000);
}
void setup() {

    Serial.begin(250000);
    pinMode(D2, INPUT_PULLUP);
    dht.setup(D4, DHTesp::DHT11);

    Main_interval = loadLong(prom_interval);
    if (Main_interval <    1) Main_interval =    1;
    if (Main_interval > 3600) Main_interval = 3600;

    wifi_connect;
    delay(100); delay(100); delay(100); 
    if (WiFi.status() != WL_CONNECTED) {
        Serial.print("\nGoing to sleep. No WiFi!");
        sleepNow();
    }

    int _temp = dht.getTemperature();
    int _humi = dht.getHumidity();
    Weather_temp     = String( _temp );
    Weather_humidity = String( _humi );

    speakUp(2); // 1-ping 2-weather
    saveLong(prom_interval, Main_interval);

    sleepNow();
    

}
void loop(){
}


void saveLong(byte _address, long _value) {
    byte four = ( _value & 0xFF );
    byte three = ( ( _value >> 8 ) & 0xFF );
    byte two = ( ( _value >> 16 ) & 0xFF );
    byte one = ( ( _value >> 24 ) & 0xFF );
    EEPROM.write( _address, four );
    EEPROM.write( _address + 1, three );
    EEPROM.write( _address + 2, two );
    EEPROM.write( _address + 3, one );
}
long loadLong(byte _address) {
    long four = EEPROM.read( _address + 4 );
    long three = EEPROM.read( _address + 5 );
    long two = EEPROM.read( _address + 6 );
    long one = EEPROM.read( _address + 7 );
    return ( ( four << 0 ) & 0xFF ) + ( ( three << 8 ) & 0xFFFF ) + ( ( two << 16 ) & 0xFFFFFF ) + ( ( one << 24 ) & 0xFFFFFFFF );
}


void speakUp(byte _mode) {

    if(_mode == 1) {
        // upload ping
        G_var_type = "1";
        G_var_note = "ping";
    }
    if(_mode == 2) {
        // upload temp
        G_var_type = "5";
        G_var_note = "weather";
    }

    String _commands = // 1.? 2,..&
        "?proj=" + G_var_proj +
        "&type=" + G_var_type +
        "&note=" + G_var_note +
        "&temp=" + Weather_temp +
        "&humi=" + Weather_humidity +
        "&runt=" + String(millis());

    upload(_commands);
}
void upload(String _commands) {

    client = new HTTPSRedirect(443);
    client->setInsecure();
    client->setPrintResponseBody(false);
    client->setContentTypeHeader("application/json");
    if (!client->connected()){client->connect("script.google.com", 443); }

    Serial.print("\nGET: " + _commands);
    String _final = String("/macros/s/") + GScriptId + "/exec" + _commands;
    client->GET(_final, "script.google.com");

    Main_interval = String(client->getResponseBody()).toInt();
    //if (Main_interval < 1800) Main_interval = 1800;
    if (Main_interval > 3600) Main_interval = 3600;
    Serial.print("\nNew interval is: ");
    Serial.print(Main_interval);

    String _resp = String(client->getResponseBody());

    delete client;
}