export default `<?xml version="1.0" encoding="UTF-8"?>
<siteData xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://dd.weather.gc.ca/citypage_weather/schema/site.xsd">
   <license>https://dd.weather.gc.ca/doc/LICENCE_GENERAL.txt</license>
   <dateTime name="xmlCreation" zone="UTC" UTCOffset="0">
      <year>2023</year>
      <month name="August">08</month>
      <day name="Friday">04</day>
      <hour>18</hour>
      <minute>03</minute>
      <timeStamp>20230804180313</timeStamp>
      <textSummary>Friday August 04, 2023 at 18:03 UTC</textSummary>
   </dateTime>
   <dateTime name="xmlCreation" zone="EDT" UTCOffset="-4">
      <year>2023</year>
      <month name="August">08</month>
      <day name="Friday">04</day>
      <hour>14</hour>
      <minute>03</minute>
      <timeStamp>20230804140313</timeStamp>
      <textSummary>Friday August 04, 2023 at 14:03 EDT</textSummary>
   </dateTime>
   <location>
      <continent>North America</continent>
      <country code="ca">Canada</country>
      <province code="on">Ontario</province>
      <name code="s0000458" lat="43.65N" lon="79.38W">Toronto</name>
      <region>City of Toronto</region>
   </location>
   <warnings/>
   <currentConditions>
      <station code="yyz" lat="43.68N" lon="79.63W">Toronto Pearson Int&apos;l Airport</station>
      <dateTime name="observation" zone="UTC" UTCOffset="0">
         <year>2023</year>
         <month name="August">08</month>
         <day name="Friday">04</day>
         <hour>18</hour>
         <minute>00</minute>
         <timeStamp>20230804180000</timeStamp>
         <textSummary>Friday August 04, 2023 at 18:00 UTC</textSummary>
      </dateTime>
      <dateTime name="observation" zone="EDT" UTCOffset="-4">
         <year>2023</year>
         <month name="August">08</month>
         <day name="Friday">04</day>
         <hour>14</hour>
         <minute>00</minute>
         <timeStamp>20230804140000</timeStamp>
         <textSummary>Friday August 04, 2023 at 14:00 EDT</textSummary>
      </dateTime>
      <condition>Mostly Cloudy</condition>
      <iconCode format="gif">03</iconCode>
      <temperature unitType="metric" units="C">25.6</temperature>
      <dewpoint unitType="metric" units="C">15.4</dewpoint>
      <humidex unitType="metric">30</humidex>
      <pressure unitType="metric" units="kPa" change="0.01" tendency="rising">101.3</pressure>
      <visibility unitType="metric" units="km">24.1</visibility>
      <relativeHumidity units="%">53</relativeHumidity>
      <wind>
         <speed unitType="metric" units="km/h">Calm</speed>
         <gust unitType="metric" units="km/h"></gust>
         <direction qaValue="100">NNW</direction>
         <bearing units="degrees">337.0</bearing>
      </wind>
   </currentConditions>
   <forecastGroup>
      <dateTime name="forecastIssue" zone="UTC" UTCOffset="0">
         <year>2023</year>
         <month name="August">08</month>
         <day name="Friday">04</day>
         <hour>15</hour>
         <minute>00</minute>
         <timeStamp>20230804150000</timeStamp>
         <textSummary>Friday August 04, 2023 at 15:00 UTC</textSummary>
      </dateTime>
      <dateTime name="forecastIssue" zone="EDT" UTCOffset="-4">
         <year>2023</year>
         <month name="August">08</month>
         <day name="Friday">04</day>
         <hour>11</hour>
         <minute>00</minute>
         <timeStamp>20230804110000</timeStamp>
         <textSummary>Friday August 04, 2023 at 11:00 EDT</textSummary>
      </dateTime>
      <regionalNormals>
         <textSummary>Low 17. High 27.</textSummary>
         <temperature unitType="metric" units="C" class="high">27</temperature>
         <temperature unitType="metric" units="C" class="low">17</temperature>
      </regionalNormals>
      <forecast>
         <period textForecastName="Today">Friday</period>
         <textSummary>A mix of sun and cloud with 30 percent chance of showers and risk of a thunderstorm. High 27. Humidex 32. UV index 7 or high.</textSummary>
         <cloudPrecip>
            <textSummary>A mix of sun and cloud with 30 percent chance of showers and risk of a thunderstorm.</textSummary>
         </cloudPrecip>
         <abbreviatedForecast>
            <iconCode format="gif">09</iconCode>
            <pop units="%">30</pop>
            <textSummary>Chance of showers</textSummary>
         </abbreviatedForecast>
         <temperatures>
            <textSummary>High 27.</textSummary>
            <temperature unitType="metric" units="C" class="high">27</temperature>
         </temperatures>
         <winds>
            <wind index="1" rank="major">
               <speed unitType="metric" units="km/h">05</speed>
               <gust unitType="metric" units="km/h">00</gust>
               <direction>VR</direction>
               <bearing units="degrees">99</bearing>
            </wind>
         </winds>
         <precipitation>
            <textSummary/>
            <precipType start="16" end="22">rain</precipType>
         </precipitation>
         <windChill/>
         <uv category="high">
            <index>7</index>
            <textSummary>UV index 7 or high.</textSummary>
         </uv>
         <relativeHumidity units="%">60</relativeHumidity>
         <humidex>
            <textSummary>Humidex 32.</textSummary>
         </humidex>
      </forecast>
      <forecast>
         <period textForecastName="Tonight">Friday night</period>
         <textSummary>Partly cloudy. Wind northwest 20 km/h becoming light late this evening. Low 16.</textSummary>
         <cloudPrecip>
            <textSummary>Partly cloudy.</textSummary>
         </cloudPrecip>
         <abbreviatedForecast>
            <iconCode format="gif">32</iconCode>
            <pop units="%"></pop>
            <textSummary>Partly cloudy</textSummary>
         </abbreviatedForecast>
         <temperatures>
            <textSummary>Low 16.</textSummary>
            <temperature unitType="metric" units="C" class="low">16</temperature>
         </temperatures>
         <winds>
            <textSummary>Wind northwest 20 km/h becoming light late this evening.</textSummary>
            <wind index="1" rank="major">
               <speed unitType="metric" units="km/h">05</speed>
               <gust unitType="metric" units="km/h">00</gust>
               <direction>VR</direction>
               <bearing units="degrees">99</bearing>
            </wind>
            <wind index="2" rank="major">
               <speed unitType="metric" units="km/h">20</speed>
               <gust unitType="metric" units="km/h">00</gust>
               <direction>NW</direction>
               <bearing units="degrees">32</bearing>
            </wind>
         </winds>
         <precipitation>
            <textSummary/>
            <precipType start="" end=""/>
         </precipitation>
         <windChill/>
         <relativeHumidity units="%">75</relativeHumidity>
         <humidex/>
      </forecast>
      <forecast>
         <period textForecastName="Saturday">Saturday</period>
         <textSummary>Sunny. High 27. Humidex 30. UV index 8 or very high.</textSummary>
         <cloudPrecip>
            <textSummary>Sunny.</textSummary>
         </cloudPrecip>
         <abbreviatedForecast>
            <iconCode format="gif">00</iconCode>
            <pop units="%"></pop>
            <textSummary>Sunny</textSummary>
         </abbreviatedForecast>
         <temperatures>
            <textSummary>High 27.</textSummary>
            <temperature unitType="metric" units="C" class="high">27</temperature>
         </temperatures>
         <winds>
            <wind index="1" rank="major">
               <speed unitType="metric" units="km/h">05</speed>
               <gust unitType="metric" units="km/h">00</gust>
               <direction>VR</direction>
               <bearing units="degrees">99</bearing>
            </wind>
         </winds>
         <precipitation>
            <textSummary/>
            <precipType start="" end=""/>
         </precipitation>
         <windChill/>
         <uv category="very high">
            <index>8</index>
            <textSummary>UV index 8 or very high.</textSummary>
         </uv>
         <relativeHumidity units="%">45</relativeHumidity>
         <humidex>
            <textSummary>Humidex 30.</textSummary>
         </humidex>
      </forecast>
      <forecast>
         <period textForecastName="Saturday night">Saturday night</period>
         <textSummary>Clear. Low 15.</textSummary>
         <cloudPrecip>
            <textSummary>Clear.</textSummary>
         </cloudPrecip>
         <abbreviatedForecast>
            <iconCode format="gif">30</iconCode>
            <pop units="%"></pop>
            <textSummary>Clear</textSummary>
         </abbreviatedForecast>
         <temperatures>
            <textSummary>Low 15.</textSummary>
            <temperature unitType="metric" units="C" class="low">15</temperature>
         </temperatures>
         <winds/>
         <precipitation>
            <textSummary/>
            <precipType start="" end=""/>
         </precipitation>
         <windChill/>
         <relativeHumidity units="%">75</relativeHumidity>
         <humidex/>
      </forecast>
      <forecast>
         <period textForecastName="Sunday">Sunday</period>
         <textSummary>Increasing cloudiness. High 25.</textSummary>
         <cloudPrecip>
            <textSummary>Increasing cloudiness.</textSummary>
         </cloudPrecip>
         <abbreviatedForecast>
            <iconCode format="gif">10</iconCode>
            <pop units="%"></pop>
            <textSummary>Cloudy</textSummary>
         </abbreviatedForecast>
         <temperatures>
            <textSummary>High 25.</textSummary>
            <temperature unitType="metric" units="C" class="high">25</temperature>
         </temperatures>
         <winds/>
         <precipitation>
            <textSummary/>
            <precipType start="" end=""/>
         </precipitation>
         <windChill/>
         <relativeHumidity units="%">55</relativeHumidity>
         <humidex/>
      </forecast>
      <forecast>
         <period textForecastName="Sunday night">Sunday night</period>
         <textSummary>Cloudy with 30 percent chance of showers. Low 21.</textSummary>
         <cloudPrecip>
            <textSummary>Cloudy with 30 percent chance of showers.</textSummary>
         </cloudPrecip>
         <abbreviatedForecast>
            <iconCode format="gif">12</iconCode>
            <pop units="%">30</pop>
            <textSummary>Chance of showers</textSummary>
         </abbreviatedForecast>
         <temperatures>
            <textSummary>Low 21.</textSummary>
            <temperature unitType="metric" units="C" class="low">21</temperature>
         </temperatures>
         <winds/>
         <precipitation>
            <textSummary/>
            <precipType start="70" end="82">rain</precipType>
         </precipitation>
         <windChill/>
         <relativeHumidity units="%">90</relativeHumidity>
         <humidex/>
      </forecast>
      <forecast>
         <period textForecastName="Monday">Monday</period>
         <textSummary>Showers. High 24.</textSummary>
         <cloudPrecip>
            <textSummary>Showers.</textSummary>
         </cloudPrecip>
         <abbreviatedForecast>
            <iconCode format="gif">12</iconCode>
            <pop units="%"></pop>
            <textSummary>Showers</textSummary>
         </abbreviatedForecast>
         <temperatures>
            <textSummary>High 24.</textSummary>
            <temperature unitType="metric" units="C" class="high">24</temperature>
         </temperatures>
         <winds/>
         <precipitation>
            <textSummary/>
            <precipType start="82" end="94">rain</precipType>
         </precipitation>
         <windChill/>
         <relativeHumidity units="%">85</relativeHumidity>
         <humidex/>
      </forecast>
      <forecast>
         <period textForecastName="Monday night">Monday night</period>
         <textSummary>Showers. Low 18.</textSummary>
         <cloudPrecip>
            <textSummary>Showers.</textSummary>
         </cloudPrecip>
         <abbreviatedForecast>
            <iconCode format="gif">12</iconCode>
            <pop units="%"></pop>
            <textSummary>Showers</textSummary>
         </abbreviatedForecast>
         <temperatures>
            <textSummary>Low 18.</textSummary>
            <temperature unitType="metric" units="C" class="low">18</temperature>
         </temperatures>
         <winds/>
         <precipitation>
            <textSummary/>
            <precipType start="94" end="106">rain</precipType>
         </precipitation>
         <windChill/>
         <relativeHumidity units="%">95</relativeHumidity>
         <humidex/>
      </forecast>
      <forecast>
         <period textForecastName="Tuesday">Tuesday</period>
         <textSummary>A mix of sun and cloud with 60 percent chance of showers. High 26.</textSummary>
         <cloudPrecip>
            <textSummary>A mix of sun and cloud with 60 percent chance of showers.</textSummary>
         </cloudPrecip>
         <abbreviatedForecast>
            <iconCode format="gif">06</iconCode>
            <pop units="%">60</pop>
            <textSummary>Chance of showers</textSummary>
         </abbreviatedForecast>
         <temperatures>
            <textSummary>High 26.</textSummary>
            <temperature unitType="metric" units="C" class="high">26</temperature>
         </temperatures>
         <winds/>
         <precipitation>
            <textSummary/>
            <precipType start="106" end="118">rain</precipType>
         </precipitation>
         <windChill/>
         <relativeHumidity units="%">55</relativeHumidity>
         <humidex/>
      </forecast>
      <forecast>
         <period textForecastName="Tuesday night">Tuesday night</period>
         <textSummary>Clear. Low 15.</textSummary>
         <cloudPrecip>
            <textSummary>Clear.</textSummary>
         </cloudPrecip>
         <abbreviatedForecast>
            <iconCode format="gif">30</iconCode>
            <pop units="%"></pop>
            <textSummary>Clear</textSummary>
         </abbreviatedForecast>
         <temperatures>
            <textSummary>Low 15.</textSummary>
            <temperature unitType="metric" units="C" class="low">15</temperature>
         </temperatures>
         <winds/>
         <precipitation>
            <textSummary/>
            <precipType start="" end=""/>
         </precipitation>
         <windChill/>
         <relativeHumidity units="%">95</relativeHumidity>
         <humidex/>
      </forecast>
      <forecast>
         <period textForecastName="Wednesday">Wednesday</period>
         <textSummary>A mix of sun and cloud. High 27.</textSummary>
         <cloudPrecip>
            <textSummary>A mix of sun and cloud.</textSummary>
         </cloudPrecip>
         <abbreviatedForecast>
            <iconCode format="gif">02</iconCode>
            <pop units="%"></pop>
            <textSummary>A mix of sun and cloud</textSummary>
         </abbreviatedForecast>
         <temperatures>
            <textSummary>High 27.</textSummary>
            <temperature unitType="metric" units="C" class="high">27</temperature>
         </temperatures>
         <winds/>
         <precipitation>
            <textSummary/>
            <precipType start="" end=""/>
         </precipitation>
         <windChill/>
         <relativeHumidity units="%">45</relativeHumidity>
         <humidex/>
      </forecast>
      <forecast>
         <period textForecastName="Wednesday night">Wednesday night</period>
         <textSummary>Cloudy periods. Low 18.</textSummary>
         <cloudPrecip>
            <textSummary>Cloudy periods.</textSummary>
         </cloudPrecip>
         <abbreviatedForecast>
            <iconCode format="gif">32</iconCode>
            <pop units="%"></pop>
            <textSummary>Cloudy periods</textSummary>
         </abbreviatedForecast>
         <temperatures>
            <textSummary>Low 18.</textSummary>
            <temperature unitType="metric" units="C" class="low">18</temperature>
         </temperatures>
         <winds/>
         <precipitation>
            <textSummary/>
            <precipType start="" end=""/>
         </precipitation>
         <windChill/>
         <relativeHumidity units="%">90</relativeHumidity>
         <humidex/>
      </forecast>
      <forecast>
         <period textForecastName="Thursday">Thursday</period>
         <textSummary>Cloudy with 40 percent chance of showers. High 24.</textSummary>
         <cloudPrecip>
            <textSummary>Cloudy with 40 percent chance of showers.</textSummary>
         </cloudPrecip>
         <abbreviatedForecast>
            <iconCode format="gif">12</iconCode>
            <pop units="%">40</pop>
            <textSummary>Chance of showers</textSummary>
         </abbreviatedForecast>
         <temperatures>
            <textSummary>High 24.</textSummary>
            <temperature unitType="metric" units="C" class="high">24</temperature>
         </temperatures>
         <winds/>
         <precipitation>
            <textSummary/>
            <precipType start="154" end="166">rain</precipType>
         </precipitation>
         <windChill/>
         <relativeHumidity units="%">65</relativeHumidity>
         <humidex/>
      </forecast>
   </forecastGroup>
   <hourlyForecastGroup>
      <dateTime name="forecastIssue" zone="UTC" UTCOffset="0">
         <year>2023</year>
         <month name="August">08</month>
         <day name="Friday">04</day>
         <hour>15</hour>
         <minute>00</minute>
         <timeStamp>20230804150000</timeStamp>
         <textSummary>Friday August 04, 2023 at 15:00 UTC</textSummary>
      </dateTime>
      <dateTime name="forecastIssue" zone="EDT" UTCOffset="-4">
         <year>2023</year>
         <month name="August">08</month>
         <day name="Friday">04</day>
         <hour>11</hour>
         <minute>00</minute>
         <timeStamp>20230804110000</timeStamp>
         <textSummary>Friday August 04, 2023 at 11:00 EDT</textSummary>
      </dateTime>
      <hourlyForecast dateTimeUTC="202308041900">
         <condition>Chance of showers. Risk of thunderstorms</condition>
         <iconCode format="png">09</iconCode>
         <temperature unitType="metric" units="C">26</temperature>
         <lop category="Low" units="%">30</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric">31</humidex>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308042000">
         <condition>Chance of showers. Risk of thunderstorms</condition>
         <iconCode format="png">09</iconCode>
         <temperature unitType="metric" units="C">26</temperature>
         <lop category="Low" units="%">30</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric">31</humidex>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308042100">
         <condition>Chance of showers. Risk of thunderstorms</condition>
         <iconCode format="png">09</iconCode>
         <temperature unitType="metric" units="C">25</temperature>
         <lop category="Low" units="%">30</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric">30</humidex>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308042200">
         <condition>A mix of sun and cloud</condition>
         <iconCode format="png">02</iconCode>
         <temperature unitType="metric" units="C">24</temperature>
         <lop category="Low" units="%">20</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric">29</humidex>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308042300">
         <condition>A mix of sun and cloud</condition>
         <iconCode format="png">02</iconCode>
         <temperature unitType="metric" units="C">24</temperature>
         <lop category="Low" units="%">20</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric">28</humidex>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308050000">
         <condition>A mix of sun and cloud</condition>
         <iconCode format="png">02</iconCode>
         <temperature unitType="metric" units="C">23</temperature>
         <lop category="Low" units="%">20</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric">27</humidex>
         <wind>
            <speed unitType="metric" units="km/h">20</speed>
            <direction windDirFull="Northwest">NW</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308050100">
         <condition>A few clouds</condition>
         <iconCode format="png">31</iconCode>
         <temperature unitType="metric" units="C">22</temperature>
         <lop category="Low" units="%">20</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric">26</humidex>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308050200">
         <condition>A few clouds</condition>
         <iconCode format="png">31</iconCode>
         <temperature unitType="metric" units="C">22</temperature>
         <lop category="Low" units="%">20</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric">26</humidex>
         <wind>
            <speed unitType="metric" units="km/h">20</speed>
            <direction windDirFull="Northwest">NW</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308050300">
         <condition>A few clouds</condition>
         <iconCode format="png">31</iconCode>
         <temperature unitType="metric" units="C">21</temperature>
         <lop category="Low" units="%">20</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric">25</humidex>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308050400">
         <condition>A few clouds</condition>
         <iconCode format="png">31</iconCode>
         <temperature unitType="metric" units="C">20</temperature>
         <lop category="Nil" units="%">0</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric"/>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308050500">
         <condition>A few clouds</condition>
         <iconCode format="png">31</iconCode>
         <temperature unitType="metric" units="C">19</temperature>
         <lop category="Nil" units="%">0</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric"/>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308050600">
         <condition>A few clouds</condition>
         <iconCode format="png">31</iconCode>
         <temperature unitType="metric" units="C">18</temperature>
         <lop category="Nil" units="%">0</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric"/>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308050700">
         <condition>A few clouds</condition>
         <iconCode format="png">31</iconCode>
         <temperature unitType="metric" units="C">17</temperature>
         <lop category="Nil" units="%">0</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric"/>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308050800">
         <condition>A few clouds</condition>
         <iconCode format="png">31</iconCode>
         <temperature unitType="metric" units="C">17</temperature>
         <lop category="Nil" units="%">0</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric"/>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308050900">
         <condition>A few clouds</condition>
         <iconCode format="png">31</iconCode>
         <temperature unitType="metric" units="C">16</temperature>
         <lop category="Nil" units="%">0</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric"/>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308051000">
         <condition>Mainly sunny</condition>
         <iconCode format="png">01</iconCode>
         <temperature unitType="metric" units="C">17</temperature>
         <lop category="Nil" units="%">0</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric"/>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308051100">
         <condition>Mainly sunny</condition>
         <iconCode format="png">01</iconCode>
         <temperature unitType="metric" units="C">18</temperature>
         <lop category="Nil" units="%">0</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric"/>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308051200">
         <condition>Sunny</condition>
         <iconCode format="png">00</iconCode>
         <temperature unitType="metric" units="C">19</temperature>
         <lop category="Nil" units="%">0</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric"/>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308051300">
         <condition>Sunny</condition>
         <iconCode format="png">00</iconCode>
         <temperature unitType="metric" units="C">20</temperature>
         <lop category="Nil" units="%">0</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric"/>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308051400">
         <condition>Sunny</condition>
         <iconCode format="png">00</iconCode>
         <temperature unitType="metric" units="C">22</temperature>
         <lop category="Nil" units="%">0</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric">25</humidex>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308051500">
         <condition>Sunny</condition>
         <iconCode format="png">00</iconCode>
         <temperature unitType="metric" units="C">23</temperature>
         <lop category="Nil" units="%">0</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric">26</humidex>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308051600">
         <condition>Sunny</condition>
         <iconCode format="png">00</iconCode>
         <temperature unitType="metric" units="C">24</temperature>
         <lop category="Low" units="%">20</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric">27</humidex>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308051700">
         <condition>Sunny</condition>
         <iconCode format="png">00</iconCode>
         <temperature unitType="metric" units="C">25</temperature>
         <lop category="Low" units="%">20</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric">27</humidex>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
      <hourlyForecast dateTimeUTC="202308051800">
         <condition>Sunny</condition>
         <iconCode format="png">00</iconCode>
         <temperature unitType="metric" units="C">26</temperature>
         <lop category="Low" units="%">20</lop>
         <windChill unitType="metric"/>
         <humidex unitType="metric">28</humidex>
         <wind>
            <speed unitType="metric" units="km/h">5</speed>
            <direction windDirFull="Variable direction">VR</direction>
            <gust unitType="metric" units="km/h"/>
         </wind>
      </hourlyForecast>
   </hourlyForecastGroup>
   <yesterdayConditions>
      <temperature unitType="metric" units="C" class="high">29.2</temperature>
      <temperature unitType="metric" units="C" class="low">18.2</temperature>
      <precip unitType="metric" units="mm">2.6</precip>
   </yesterdayConditions>
   <riseSet>
      <disclaimer>The information provided here, for the times of the rise and set of the sun, is an estimate included as a convenience to our clients. Values shown here may differ from the official sunrise/sunset data available from (http://hia-iha.nrc-cnrc.gc.ca/sunrise_e.html)</disclaimer>
      <dateTime name="sunrise" zone="UTC" UTCOffset="0">
         <year>2023</year>
         <month name="August">08</month>
         <day name="Friday">04</day>
         <hour>10</hour>
         <minute>10</minute>
         <timeStamp>20230804101000</timeStamp>
         <textSummary>Friday August 04, 2023 at 10:10 UTC</textSummary>
      </dateTime>
      <dateTime name="sunrise" zone="EDT" UTCOffset="-4">
         <year>2023</year>
         <month name="August">08</month>
         <day name="Friday">04</day>
         <hour>06</hour>
         <minute>10</minute>
         <timeStamp>20230804061000</timeStamp>
         <textSummary>Friday August 04, 2023 at 06:10 EDT</textSummary>
      </dateTime>
      <dateTime name="sunset" zone="UTC" UTCOffset="0">
         <year>2023</year>
         <month name="August">08</month>
         <day name="Saturday">05</day>
         <hour>00</hour>
         <minute>37</minute>
         <timeStamp>20230805003700</timeStamp>
         <textSummary>Saturday August 05, 2023 at 00:37 UTC</textSummary>
      </dateTime>
      <dateTime name="sunset" zone="EDT" UTCOffset="-4">
         <year>2023</year>
         <month name="August">08</month>
         <day name="Friday">04</day>
         <hour>20</hour>
         <minute>37</minute>
         <timeStamp>20230804203700</timeStamp>
         <textSummary>Friday August 04, 2023 at 20:37 EDT</textSummary>
      </dateTime>
   </riseSet>
   <almanac>
      <temperature class="extremeMax" period="1938-2012" unitType="metric" units="C" year="1944">35.0</temperature>
      <temperature class="extremeMin" period="1938-2012" unitType="metric" units="C" year="1951">7.2</temperature>
      <temperature class="normalMax" unitType="metric" units="C">26.7</temperature>
      <temperature class="normalMin" unitType="metric" units="C">15.0</temperature>
      <temperature class="normalMean" unitType="metric" units="C">20.9</temperature>
      <precipitation class="extremeRainfall" period="1938-2012" unitType="metric" units="mm" year="1981">36.4</precipitation>
      <precipitation class="extremeSnowfall" period="1938-2012" unitType="metric" units="cm" year="1938">0.0</precipitation>
      <precipitation class="extremePrecipitation" period="1938-2012" unitType="metric" units="mm" year="1981">36.4</precipitation>
      <precipitation class="extremeSnowOnGround" period="1955-2012" unitType="metric" units="cm" year="1955">0.0</precipitation>
      <pop units="%">33.0</pop>
   </almanac>
</siteData>`;
