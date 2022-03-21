# GhostThermostat
<H1>Node-Red - UI Template - Thermostat Dashboard Widget</H1>

This widget is based on the [aarnau / node-red-contrib-ui-thermostat](https://github.com/aarnau/node-red-contrib-ui-thermostat).

With this widget you can display and control your heating/cooling via Node-red dashboard.

![immagine](https://user-images.githubusercontent.com/3819353/159188615-94848d78-95f7-4ed6-a189-aca4ebb1b8c2.png)

It's fully responsive and can be setted by touch

<h2>General Usage</h2>

You can set target temperature by pressing on down left zone of the quadrant (where is the label "SET") then widget show you another panel where you can change target temperature. Once set, just touch the top of the dial to return to the main panel

![immagine](https://user-images.githubusercontent.com/3819353/159188861-902aa4fd-79ab-4d12-bea8-c0a996b83446.png) ![immagine](https://user-images.githubusercontent.com/3819353/159188930-015d2274-e97c-4371-be93-266467c89def.png)

in the same way, by pressing the bottom right, you can choose the mode, at this moment there are three different types of mode: "heating", "cooling" and "off".

![immagine](https://user-images.githubusercontent.com/3819353/159189023-d9cd643f-5c84-4b75-b6f7-349bf6db78f6.png) 

Heating mode:

![immagine](https://user-images.githubusercontent.com/3819353/159189052-6bb03633-072d-4c07-add5-a1dd158f4818.png) 

Cooling mode:

![immagine](https://user-images.githubusercontent.com/3819353/159189098-d5613104-2b96-47e2-860a-c260df99a210.png)

Off:

![immagine](https://user-images.githubusercontent.com/3819353/159189197-7e118f10-5688-4b7e-b6e9-0eececb4a15d.png)

<h2>Led Rign</h2>
Ther ring arround the quandrant change color 

the ring around the dial changes color as conditions turn the thermostat on or off. By default the colors are: gray for when the thermostat is off, orange for when the heating is on and blue for when the air conditioning is on. Obviously the LED will light up when the room temperature is lower than the target one for heating and vice versa for air conditioning

![immagine](https://user-images.githubusercontent.com/3819353/159189440-60351275-b16d-4192-97c7-c137b5de76cc.png) ![immagine](https://user-images.githubusercontent.com/3819353/159189460-b073ec1b-e1a2-4fab-a16b-4b10d3acd2e7.png)

<h2>Input and Output</h2>

you can push in input:

- <code>ambient_temperature</code> Your temperature readings numeric payload.
- <code>target_temperature</code> [optional] your thermostat setpoint numeric payload.
- <code>mode</code> [optional] string (<code>heating</code>/<code>cooling</code>/<code>off</code>) payload.
- <code>away</code> [optional] boolean (<code>true</code>/<code>false</code>) payload.

Input Example:

```
msg.topic = 'ambient_temperature';
var data = {
    'ambient_temperature':msg.payload.ambient,
    'target_temperature':msg.payload.target
}
msg.payload = data;
return msg;
```


you can got msg output every time **switch state** or **target_temperature** (this so you can store in globa variable) change:
- <code>ambient_temperature</code> actual ambient temperature
- <code>target_temperature</code> actual setted teperature
- <code>mode</code>actual mode
- <code>switch_state</code> swtitch state (<code>heating</code> if heating in on - <code>cooling</code> if ac is on - <code>off</code> if is off)
- <code>away</code>if away is enabled (<code>treu</code>/<code>false</code>)


<h2>Flow Example</h2>

In this example we take the ambient temperature from the DHT22 sensor (connected to the Rasperry PI) and, through our widget, we control the relays that switch the heating or air conditioning on or off:

![immagine](https://user-images.githubusercontent.com/3819353/159190806-f93833c7-53bf-49d3-a419-62448a7d1173.png)

ambient_temperature node:

```
msg.topic = 'ambient_temperature';  
var data = {
    'ambient_temperature':msg.payload || 20
}
msg.payload = data; 
return msg;
```
