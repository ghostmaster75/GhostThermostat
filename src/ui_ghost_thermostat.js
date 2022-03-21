var mousedownID = -1;
var ghostThermostatDial = (function() {
	console.log("START");

	function createSVGElement(tag, attributes, appendTo) {
		var element = document.createElementNS('http://www.w3.org/2000/svg', tag);
		attr(element, attributes);
		if (appendTo) {
			appendTo.appendChild(element);
		}
		return element;
	}

	function attr(element, attrs) {
		for (var i in attrs) {
			element.setAttribute(i, attrs[i]);
		}
	}

	function setClass(el, className, state) {
		el.classList[state ? 'add' : 'remove'](className);
	}

	return function(targetElement, options) {
		console.log("RET FUN");
		var self = this;

		/*
		 * Options
		 */
		options = options || {};
		options = {
			diameter: options.diameter || 400,
			mintemp: options.mintemp || 10, // Minimum value for target temperature
			maxtemp: options.maxtemp || 30, // Maximum value for target temperature
			ledColors : {'off' : 'rgb(143,141,141)', 'heating' : 'rgb(255,128,0)', 'cooling' : 'rgb(81,170,214)'}, //Led Ring Colors
			onChangeState: options.onChangeState || function() {} // Function called when  switch state change
		};

		/*
		 * Properties
		 */
		var properties = {
			radius: options.diameter / 2,
			modes: [{
				label: "heating",
				icon: "\uf06d",
				color: "orange"
			}, {
				label: 'cooling',
				icon: "\uf2dc",
				color: "rgb(81,170,214)"
			}, {
				label: "off",
				icon: "\uf011",
				color: "rgb(230,0,0)"
			} /*, {
				label: 'away',
				icon: "\uf1ce",
				color: "gray"
			} */],
			modeNames : ["heating", "cooling", "off"],
			swtitchStates : ["heating", "cooling", "off"]
		};

		/*
		 * Object state
		 */
		var state = {
			target_temperature: options.mintemp,
			ambient_temperature: options.maxtemp,
			mode: properties.modes.indexOf(properties.modes[0]),
			switch_state: 'off',
			away: false
		};
		
		/*
		 * Property getter / setters
		 */
		Object.defineProperty(this,'target_temperature',{
			get: function() {
				return state.target_temperature;
			},
			set: function(val) {
				state.target_temperature = rangedTemperature(+val);
				render()
			}
		});
		
		Object.defineProperty(this,'ambient_temperature',{
			get: function() {
				return state.ambient_temperature;
			},
			set: function(val) {
				state.ambient_temperature = +val;
				render();
			}
		});
		
		Object.defineProperty(this,'mode_name',{
			get: function() {
				return properties.modeNames[state.mode];
			},
			set: function(val) {
				if (properties.modeNames.indexOf(val)>=0) {
					state.mode = properties.modeNames.indexOf(val);
					render();
				}
			}
		});
		
		Object.defineProperty(this,'switch_state',{
			get: function() {
				return state.switch_state;
			},
			set: function(val) {
				if (properties.modeNames.indexOf(val)>=0) {
					state.switch_state = val;
					render();
				}
			}
		});
		
		
		function str2bool(strvalue){
          return (strvalue && typeof strvalue == 'string') ? (strvalue.toLowerCase() == 'true') : (strvalue == true);
        }   
        
        Object.defineProperty(this,'away',{
			get: function() {
				return state.away;
			},
			set: function(val) {
				state.away = !!str2bool(val);
				render();
			}
		});
        
		
		/*
		 * SVG
		 */
		var svg = createSVGElement('svg', {
			width: '100%', //options.diameter+'px',
			height: '100%', //options.diameter+'px',
			viewBox: '0 0 ' + options.diameter + ' ' + options.diameter,
			class: 'dial'
		}, targetElement);

		// DEFS 
		var defs = createSVGElement('defs', null, svg);

		var qgradient = createSVGElement('linearGradient', {
			'id': 'qGradient',
			gradientTransform: 'rotate(65)'
		}, defs);
		var stop = createSVGElement('stop', {
			'offset': '50%',
			'stop-color': 'rgb(86,89,94)'
		}, qgradient);
		var stop = createSVGElement('stop', {
			'offset': '65%',
			'stop-color': 'rgb(30,30,30)'
		}, qgradient);

		var qGradientT = createSVGElement('linearGradient', {
			'id': 'qGradientT',
			gradientTransform: 'rotate(65)'
		}, defs);
		var stop = createSVGElement('stop', {
			'offset': '55%',
			'stop-color': '#3b3e43',
			'stop-opacity': '1'
		}, qGradientT);
		var stop = createSVGElement('stop', {
			'offset': '90%',
			'stop-color': 'rgb(0,0,0)',
			'stop-opacity': '1'
		}, qGradientT);

		var clipPath = createSVGElement('clipPath', {
			'id': 'qClip',
		}, defs);
		var circle = createSVGElement('circle', {
			cx: properties.radius,
			cy: properties.radius,
			r: properties.radius - 25
		}, clipPath);


		var ledRingGradient = createSVGElement('radialGradient', {
			'id': 'ledColor',
			'cx': "50%",
			'cy': "50%",
			'r': "95%",
			'fx': "50%",
			'fy': "50%"
		}, defs);
		var ledRingGradientColorIn = createSVGElement('stop', {
			'offset': '45%',
			'stop-color': 'rgb(255,0,130)',
			'stop-opacity': '1'
		}, ledRingGradient);
		var ledRingGradientColorOut = createSVGElement('stop', {
			'offset': '65%',
			'stop-color': 'rgb(0,0,0)',
			'stop-opacity': '1'
		}, ledRingGradient);

		var egradient = createSVGElement('linearGradient', {
			'id': 'eGradient',
			gradientTransform: 'rotate(55)'
		}, defs);
		var stop = createSVGElement('stop', {
			'offset': '55%',
			'stop-color': '#888888',
			'stop-opacity': '1'
		}, egradient);
		var stop = createSVGElement('stop', {
			'offset': '95%',
			'stop-color': '#333333',
			'stop-opacity': '1'
		}, egradient);

		// DIAL
		var circle = createSVGElement('circle', {
			cx: properties.radius,
			cy: properties.radius,
			r: properties.radius,
			class: 'eGradient'
		}, svg);
		var ledRing = createSVGElement('circle', {
			cx: properties.radius,
			cy: properties.radius,
			r: properties.radius - 3,
			'stroke': 'black',
			'stroke-width': '1',
			class: 'led'
		}, svg);
		var circle = createSVGElement('circle', {
			cx: properties.radius,
			cy: properties.radius,
			r: properties.radius - 20,
			class: 'qGradient'
		}, svg);
		var circle = createSVGElement('circle', {
			cx: properties.radius,
			cy: properties.radius,
			r: properties.radius - 25,
			class: 'qGradient'
		}, svg);
		var lblMain = createSVGElement('text', {
			x: properties.radius,
			y: 70,
			class: 'lbl lblDial'
		}, svg);
		var lblMainText = document.createTextNode('AMBIENT');
		lblMain.appendChild(lblMainText);

		var lblAmbient = createSVGElement('text', {
			x: properties.radius,
			y: 210,
			'font-size': '160',
			class: 'lbl lblAmbient'
		}, svg);
		var lblAmbientText = document.createTextNode('21');
		lblAmbient.appendChild(lblAmbientText);
		var lblAmbientDec = createSVGElement('tspan', {
			'font-size': '60',
		}, lblAmbient);
		var lblAmbientDecText = document.createTextNode('.5');
		lblAmbientDec.appendChild(lblAmbientDecText);

		var line = createSVGElement('line', {
			x1: 55,
			y1: properties.radius + 35,
			x2: options.diameter - 55,
			y2: properties.radius + 35,
			'stroke': '#DDDDDD',
			'stroke-width': '1',
			'opacity': '0.8'
		}, svg);

		var lblLeft = createSVGElement('text', {
			x: 125,
			y: properties.radius + 75,
			class: 'lbl lblDial'
		}, svg);
		var lblLeftText = document.createTextNode('SET');
		lblLeft.appendChild(lblLeftText);

		var lblTarget = createSVGElement('text', {
			x: 125,
			y: properties.radius + 115,
			'font-size': '35',
			class: 'lbl lblTarget'
		}, svg);
		var lblTargetText = document.createTextNode('20');
		lblTarget.appendChild(lblTargetText);

		var lblTargetDec = createSVGElement('tspan', {
			'font-size': '20',
		}, lblTarget);

		var lblTargetDecText = document.createTextNode('.5');
		lblTargetDec.appendChild(lblTargetDecText);

		var lblRight = createSVGElement('text', {
			x: options.diameter - 125,
			y: properties.radius + 75,
			class: 'lbl lblDial'
		}, svg);
		var lblRightText = document.createTextNode('MODE');
		lblRight.appendChild(lblRightText);

		var lblMode = createSVGElement('text', {
			x: options.diameter - 125,
			y: properties.radius + 115,
			'font-size': '35',
			class: 'lbl lblTarget icon'
		}, svg);
		var lblModeText = document.createTextNode(properties.modes[0].icon);
		lblMode.appendChild(lblModeText);

		var btnSet = createSVGElement('g', {
			transform: 'translate(200,200)'
		}, svg);
		var path = createSVGElement('path', {
			d: 'M0,40 L0,175   A175,175 0 0,1 -175,40    z',
			fill: 'blue',
			opacity: '0',
			'id': 'btnLeft'
		}, btnSet);
		var path = createSVGElement('path', {
			d: 'M0,40 L175,40   A175,175 0 0,1    0,175  z',
			fill: 'red',
			opacity: '0',
			'id': 'btnRight'
		}, btnSet);



		document.getElementById("btnLeft").onclick = function() {
			setTargetClick();
		};

		document.getElementById("btnRight").onclick = function() {
			setModeClick();
		};

		var targetPanel = false;
		var modePanel = false;

		var lblAmbientAttributes = {
			x: lblAmbient.getAttribute('x'),
			y: lblAmbient.getAttribute('y'),
			size: lblAmbient.getAttribute('font-size')
		};

		var lblAmbientDecAttributes = {
			x: lblAmbientDec.getAttribute('x'),
			y: lblAmbientDec.getAttribute('y'),
			size: lblAmbientDec.getAttribute('font-size')
		};

		var lblTargetAttributes = {
			x: lblTarget.getAttribute('x'),
			y: lblTarget.getAttribute('y'),
			size: lblTarget.getAttribute('font-size')
		};

		var lblTargetDecAttributes = {
			x: lblTargetDec.getAttribute('x'),
			y: lblTargetDec.getAttribute('y'),
			size: lblTargetDec.getAttribute('font-size')
		};

		var lblModeAttributes = {
			x: lblMode.getAttribute('x'),
			y: lblMode.getAttribute('y'),
			size: lblMode.getAttribute('font-size')
		}

		var lblRightAttributes = {
			x: lblRight.getAttribute('x'),
			y: lblRight.getAttribute('y'),
			size: lblRight.getAttribute('font-size')
		};

		var lblLeftAttributes = {
			x: lblLeft.getAttribute('x'),
			y: lblLeft.getAttribute('y'),
			size: lblLeft.getAttribute('font-size')
		};
		
		render();

        function setAmbientTemperature(ambientTemp) {
            var splitValues =  separateDecValue(ambientTemp);
			lblAmbientText.textContent = splitValues.int;
			lblAmbientDecText.textContent = splitValues.dec;
		}


		function calcTargetTemperature(operation) {
			let currentTemp = Number(parseFloat(lblTargetText.textContent + lblTargetDecText.textContent)).toFixed(1);
			let targetTemp = (operation == '-' ? Number(Number(currentTemp) - 0.5).toFixed(1) : Number(Number(currentTemp) + 0.5).toFixed(1));
			targetTemp = rangedTemperature(targetTemp);
            setTargetTemperature(targetTemp);
            chkSwitchState();
		}
		
        function setTargetTemperature(targetTemp) {
            var splitValues =  separateDecValue(targetTemp);
			lblTargetText.textContent = splitValues.int;
			lblTargetDecText.textContent = splitValues.dec;
			if (state.target_temperature != targetTemp) {
			    if (typeof options.onChangeState == 'function') {
			        state.target_temperature = targetTemp
					options.onChangeState(self.target_temperature);
			    };
			}
		}
		
		function separateDecValue(floatFalue) {
		    var int = Math.floor(floatFalue);
		    var dec = Math.floor(((floatFalue % 1) * 10)) > 0 ? ("." + Math.floor(((floatFalue % 1) * 10))) : "";
		    return {int , dec};
		}
		
		function rangedTemperature(temperature) {
		    temperature = temperature < options.mintemp ? options.maxtemp : temperature;
			temperature = temperature > options.maxtemp ? options.mintemp : temperature;
			return temperature;
		}
		
		function chkSwitchState() {
		    var startSwitchState = state.switch_state;
		    switch (state.mode) {
		        case 0:
		            state.switch_state = state.ambient_temperature < state.target_temperature ? 'heating' : 'off';
		            setClass(ledRing, "led-off", 0);
		            break;
		        case 1:
		            state.switch_state = state.ambient_temperature > state.target_temperature ? 'cooling' : 'off';
		            break;
		        default:
		            state.switch_state = 'off'
		    }
		    
		    ledRingGradientColorIn.setAttribute('stop-color', options.ledColors[state.switch_state]);
		    
		    if (state.switch_state != startSwitchState) {
		        //state.switch_state = switch_state;
		        console.log("----" + state.switch_state);
		        if (typeof options.onChangeState == 'function') {
					options.onChangeState(self.switch_state);
			    };
		    };
		}
		

		function resetButton() {
			document.getElementById("btnLeft").onmousedown = "";
			document.getElementById("btnLeft").onmouseup = "";
			document.getElementById("btnLeft").onclick = function() {
				setTargetClick();
			};
			document.getElementById("btnRight").onmousedown = "";
			document.getElementById("btnRight").onmouseup = "";
			document.getElementById("btnRight").onclick = function() {
				setModeClick();
			};
		}

		function switchMainView(element, originalAttributes, mainLabel, leftLabel, rightLabel, panelState) {
			setClass(lblAmbient, "nodisplay", panelState);
			setClass(lblMain, "animate", panelState);
			setClass(lblLeft, "animate", panelState);
			setClass(lblRight, "animate", panelState);
			setClass(element, "animate", panelState);

			lblMainText.textContent = panelState ? mainLabel : "AMBIENT";
			lblLeftText.textContent = panelState ? leftLabel : "SET";

			lblLeft.setAttribute('y', panelState ? Number(lblLeftAttributes.y) + 40 : lblLeftAttributes.y);
			lblLeft.setAttribute('font-size', panelState ? "3.5em" : "1em");

			lblRightText.textContent = panelState ? rightLabel : "MODE";
			lblRight.setAttribute('y', panelState ? Number(lblRightAttributes.y) + 40 : lblRightAttributes.y);
			lblRight.setAttribute('font-size', panelState ? "3.5em" : "1em");

			element.setAttribute('x', panelState ? lblAmbientAttributes.x : originalAttributes.x);
			element.setAttribute('x', panelState ? lblAmbientAttributes.x : originalAttributes.x);
			element.setAttribute('y', panelState ? lblAmbientAttributes.y : originalAttributes.y);
			element.setAttribute('font-size', panelState ? lblAmbientAttributes.size : originalAttributes.size);

		}


		function setTargetClick() {

			targetPanel = targetPanel ? false : true;
			setClass(lblMode, "nodisplay", targetPanel);
			switchMainView(lblTarget, lblTargetAttributes, "SET", "-", "+", targetPanel);

			lblTargetDec.setAttribute('font-size', targetPanel ? lblAmbientDecAttributes.size : lblTargetDecAttributes.size);

			if (targetPanel) {
				document.getElementById("btnLeft").onclick = "";
				document.getElementById("btnRight").onclick = "";

				document.getElementById("btnLeft").onmousedown = function() {
					calcTargetTemperature("-");
					if (mousedownID == -1) { //Prevent multimple loops!
						mousedownID = setInterval(calcTargetTemperature, 500, '-');
					}
				};
				document.getElementById("btnLeft").onmouseup = function() {
					if (mousedownID != -1) { //Only stop if exists
						clearInterval(mousedownID);
						mousedownID = -1;
					}
				};

				document.getElementById("btnRight").onmousedown = function() {
					calcTargetTemperature("+");
					if (mousedownID == -1) { //Prevent multimple loops!
						mousedownID = setInterval(calcTargetTemperature, 500, '+');
					}
				};
				document.getElementById("btnRight").onmouseup = function() {
					if (mousedownID != -1) { //Only stop if exists
						clearInterval(mousedownID);
						mousedownID = -1;
					}
				};

				lblTarget.onclick = function() {
					setTargetClick();
				};
			} else {
				resetButton()
			}
		};

		function setModeClick() {

			modePanel = modePanel ? false : true;
			setClass(lblTarget, "nodisplay", modePanel);
			switchMainView(lblMode, lblModeAttributes, "MODE", "<", ">", modePanel);

			if (modePanel) {
			    
				document.getElementById("btnLeft").onclick = function() {
				    mode = state.mode;
				    mode = --mode < 0 ? properties.modes.length - 1 : mode;
				    lblMode.textContent = properties.modes[mode].icon;
				    lblMode.style.fill = properties.modes[mode].color;
				    state.mode = mode;
				    render();
				};
				
				document.getElementById("btnRight").onclick = function() {
				    mode = state.mode;
				    mode = ++mode > properties.modes.length - 1 ? 0 : mode;
				    lblMode.textContent = properties.modes[mode].icon;
				    lblMode.style.fill = properties.modes[mode].color;
				    state.mode = mode;
				    render();
				};
				
				lblMode.onclick = function() {
					setModeClick();
				};
			} else {
				resetButton()
			}
		};
		
		function render() {
		    setAmbientTemperature(self.ambient_temperature);
		    setTargetTemperature(self.target_temperature);
		    chkSwitchState();
		};

	};
})();

var initializing = true;

(function(scope) {
	var ghostThermostat = new ghostThermostatDial(document.getElementById('GhostThermostat'),{
    	onChangeState: function(v) {
    	    console.log("ONSET" + new Date().getTime());
    	    var p = {
    	        "ambient_temperature":ghostThermostat.ambient_temperature,
    	        "target_temperature":ghostThermostat.target_temperature,
        	    "mode": ghostThermostat.mode_name,
        	    "switch_state":v,
    	        "away":ghostThermostat.away
    	    };
            scope.send({topic: "changed_state", payload: p});
    	}
    });

	scope.$watch('msg', function(data) {
		if (initializing) {
			initializing = false;
		} else {
            ghostThermostat.ambient_temperature = data.payload.ambient_temperature || ghostThermostat.ambient_temperature;
            ghostThermostat.target_temperature = data.payload.target_temperature || ghostThermostat.target_temperature;
            ghostThermostat.mode_name = data.payload.mode || ghostThermostat.mode_name;
            ghostThermostat.switch_state = data.payload.switch_state || ghostThermostat.switch_state;
            ghostThermostat.away = data.payload.away || ghostThermostat.away;
		}
	});
})(scope);
