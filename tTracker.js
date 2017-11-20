'use strict'
var flatpickr = require('flatpickr')

registerPlugin(proto(Gem, function(){
	this.name = 'TimeTracker'

	// set ticket field options
	this.initialize = function(options){
		return{
			timesWorkedField: 'timesWorked',
			settingsField: 'settings',
			subfields: {
				userField: 'user',
				checkInField: 'checkIn',
				checkOutField: 'checkOut',
				minWorkedField: 'minWorked',
				dateField: 'date',
				nameField: 'name',
				inField: 'in',
				timerInputField: 'timer',
				durationInputField: 'duration'

			}
		}
	}

	this.requireFields = function(options){
		var result = {}
		result[options.timesWorkedField] = {
			type: 'compound',
			list: true,
			fields: {
				user: {type: 'choice', choices: 'Users'},
				checkIn: {type: 'integer'},
				checkOut: {type: 'integer'},
				minWorked: {type: 'integer'},
				date: {type: 'integer'}
			}
		}
		result[options.settingsField] = {
			type: 'compound',
			list: true,
			fields: {
				name: {type: 'choice', choices: 'Users'},
				in: {type: 'integer'},
				timer: {type: 'choice', choices: [true, false]},
				duration: {type: 'choice', choices: [true, false]}
			}
		}
		return result
	}

	this.build = function(ticket, optionsObservee, api){
		this.ticket = ticket
		this.api = api
		this.optionsObservee = optionsObservee
		this.tWorkedField = optionsObservee.subject.timesWorkedField
		this.settingsField = optionsObservee.subject.settingsField
		this.settings = this.ticket.get(this.settingsField).subject
		this.settingsFieldObservee = this.ticket.get(this.settingsField)
		var that = this
		console.log('settingsField line 62', ticket.get(this.settingsField))

		// Default Input Method
		this.selectTimer = CheckBox()
		this.selectDuration = CheckBox()
		var closeInput = Button('close', 'close')
		var selectInput = Block('div', Text('Select a default input method '), this.selectTimer, Text('Timer '), this.selectDuration, Text('Duration'), closeInput)
		selectInput.visible = false

		// Timer
		this.checkIn = TextField()
		this.checkOut = TextField()
		this.workedText = Text()
		this.workedText.visible = false
		var errMessage = Text('error', 'Your End Time must be later than your Start Time')
		errMessage.visible = false
		this.timer = Block('div', Text('Start Time: '), this.checkIn, Text(' End Time: '), this.checkOut, errMessage, this.workedText)

		// Duration
		var minutes = TextField()
		var date = TextField()
		var errorMessage = Text('error', 'You must enter a number for Minutes Worked and a Date')
		errorMessage.visible = false
		var success = Text('Your Time Has Been Recorded')
		success.visible = false
		this.duration = Block('div', Text('Minutes Worked: '), minutes, Text(' Date: '), date, errorMessage, success)

		// Table
		var openTable = Button('Work History')
		var closeTable = Button('close', 'close')
		closeTable.visible = false
		var table = Table()
		table.visible = false
		var tableText = Text('total', 'time worked')
		tableText.visible = false
		var showTable = Block('div', openTable, table, tableText, closeTable)	

		var inputSetting = Image(require('url-loader!./settingsGear.png'))


		// Timer - flatpickr options
		this.fp_options = {
			enableTime: true,
			dateFormat: 'm-d-Y h:i K',
			minuteIncrement: 1,
			maxDate: 'today',
			defaultDate: null,
			onClose: function(){
				that.storeIn()
			}
		}

		// check for input method settings
		this.getSettings().then(function(){
			that.add(inputSetting, selectInput, that.timer, that.duration, showTable)
		}).done()

		// Timer - checkIn Time
		console.log('fp_options ', this.fp_options)
		var fp_in = new flatpickr(this.checkIn.domNode, this.fp_options)

		// Timer - checkOut Time
		var fp_out = new flatpickr(this.checkOut.domNode, {
			enableTime: true,
			dateFormat: 'm-d-Y h:i K',
			minuteIncrement: 1,
			maxDate: 'today',
			onClose: function(){
				// get tempIn time for current user then compare it to checkOut.val
				api.User.current().then(function(curUser){
					var index = -1
					// var inSubject = ticket.get(that.settingsField).subject
					that.settings.forEach(function(setting, i){
						if(curUser.subject._id === setting.nameField){
							index = i
						}
					})
					if(index === -1){
						errMessage.text = 'Please enter a Start Time before entering an End Time'
						errMessage.visible = true
						that.checkOut.val = ''
					} else if(that.checkOut.val == '' || new Date(that.checkOut.val).getTime() < ticket.get(that.settingsField).subject[index].inField){
						errMessage.text = 'Please enter an End Time that is later than the Start Time'
						errMessage.visible = true
						that.checkOut.val = ''
					} else{
						errMessage.visible = false
						that.saveTime(index)
						console.log('settingsField ', ticket.get(that.settingsField))
					}
				}).done()
			}
		})

		// Duration
		var fp_duration = new flatpickr(date.domNode, {
			dateFormat: 'm-d-Y',
			maxDate: 'today',
			onClose: function(){
				if(date.val == '' || Number.isInteger(parseInt(minutes.val)) === false){
					errorMessage.visible = true
					minutes.val = ''
					date.val = ''
				} else{
					errorMessage.visible = false
					api.User.current().then(function(curUser){
						var fields = optionsObservee.subject
						var data = {}
						data[fields.subfields.userField] = curUser.subject._id
						data[fields.subfields.dateField] = new Date(date.val).getTime()
						data[fields.subfields.minWorkedField] = parseInt(minutes.val)
						ticket.get(that.tWorkedField).push(data)
						success.visible = true
						setTimeout(function(){
							success.visible = false
						}, 3000)
						minutes.val = ''
						date.val = ''
					}).done()
				}
			}
		})

		// Table
		openTable.on('click', function(){
			inputSetting.visible = false
			table.header(['USER', 'DATE', 'MINUTES'])
			var rows = ticket.get(that.tWorkedField).subject
			var totalMin = 0
			var tRows = []
			rows.forEach(function(row){
				tRows.push(api.User.loadOne(row.user).then(function(users){
					if(!('checkIn' in row)){
						table.row([
							Text(users.subject.name),
							Text((new Date(row.date).getMonth()+1) + '-' + new Date(row.date).getDate() + '-' + new Date(row.date).getFullYear()),
							Text(row.minWorked)
						])
						totalMin += row.minWorked
					} else{
						table.row([
							Text(users.subject.name),
							Text((new Date(row.checkIn).getMonth()+1) + '-' + new Date(row.checkIn).getDate() + '-' + new Date(row.checkIn).getFullYear()),
							Text((new Date(row.checkOut) - new Date(row.checkIn))/1000/60)
						])
						totalMin += ((new Date(row.checkOut) - new Date(row.checkIn))/1000/60)
					}
				}))
			})
			Future.all(tRows).then(function(){
				if(totalMin < 60){
					tableText.text = 'Total Time Worked: ' + totalMin + ' Minutes'
				} else{
					tableText.text = 'Total Time Worked: ' + (Math.floor(totalMin/60)) + ' Hours ' + (totalMin%60) + ' Minutes'
				}
				table.visible = true
				tableText.visible = true
				closeTable.visible = true
				openTable.visible = false
				that.duration.visible = false
				that.timer.visible = false
			}).done()
		})

		closeTable.on('click', function(){
			table.visible = false
			tableText.visible = false
			closeTable.visible = false
			openTable.visible = true
			that.duration.visible = true
			that.timer.visible = true
			inputSetting.visible = true
			table.remove(table.children)
			that.getSettings()
		})

		// Default Input Method
		inputSetting.on('click', function(){
			selectInput.visible = true
			that.timer.visible = false
			that.duration.visible = false
			showTable.visible = false
			inputSetting.visible = false
		})
		
		this.selectTimer.on('change', function(){
			that.setTimer()
		})
		
		this.selectDuration.on('change', function(){
			that.setDuration()
		})

		closeInput.on('click', function(){
			selectInput.visible = false
			inputSetting.visible = true
			showTable.visible = true
			that.getSettings()
		})

		// css stylesheet for flatpickr
		this.on('attach', function(){
			var flatpickrStylesheet = require('raw-loader!flatpickr/dist/flatpickr.min.css')
			var style = document.createElement('style')
			style.innerHTML = flatpickrStylesheet
			document.head.appendChild(style)
		})
	}

	// Timer -save checkIn temporarily
	this.storeIn = function(){
		console.log('in storeIn ', this.ticket.get(this.settingsField))
		var that = this
		return this.api.User.current().then(function(curUser){
			var saveIn = function(){
				var fields = that.optionsObservee.subject
				var info = {}
				info[fields.subfields.nameField] = curUser.subject._id
				info[fields.subfields.inField] = new Date(that.checkIn.val).getTime()
				that.ticket.get(that.settingsField).push(info)				
			}
			if(that.settings.length === 0){
				saveIn()
			} else{
				that.settings.forEach(function(setting, index){
					if(setting.name === curUser.subject._id){
						console.log(index)
						// that.settingsFieldObservee.set([index,'timer'], !setting.timer)
						that.settingsFieldObservee.set([index, 'in'], new Date(that.checkIn.val).getTime())
					} else{
						saveIn()
					}
				})				
			}
		})
	}

	// Timer - find how long worked and save everything to ticket
	this.saveTime = function(index){
		var that = this
		var msWorked = new Date(that.checkOut.val).getTime() - this.ticket.get(this.settingsField).subject[index].inField
		var hours = Math.floor(msWorked/1000/60/60)
		msWorked -= hours*1000*60*60
		var minutes = Math.floor(msWorked/1000/60)
		this.workedText.text = 'You worked ' + hours + ' hours and ' + minutes + ' minutes.'
		this.workedText.visible = true
		setTimeout(function(){
			that.workedText.visible = false
		}, 5000)
		return this.api.User.current().then(function(user){
			console.log('tWorkedField ', that.ticket.get(that.tWorkedField))
			var fields = that.optionsObservee.subject
			var stats = {}
			stats[fields.subfields.userField] = user.subject._id
			stats[fields.subfields.checkInField] = that.ticket.get(that.settingsField).subject[index].inField
			stats[fields.subfields.checkOutField] = new Date(that.checkOut.val).getTime()
			that.ticket.get(that.tWorkedField).push(stats)
			console.log('tWorkedField ', that.ticket.get(that.tWorkedField))
			that.checkIn.val = ''
			that.checkOut.val = ''
			that.settings.forEach(function(setting, index){
				if(setting.name === user.subject._id){
					that.settingsFieldObservee.set([index,'in'], 0)
				}
			})
			console.log('settingsField ', that.ticket.get(that.settingsField))
		})
	}

	// Default Input Method
	this.getSettings = function(){
		var that = this
		// console.log('in this.settings')
		return this.api.User.current().then(function(user){
			if(that.settings.length === 0){
				that.timer.visible = true
				that.selectTimer.selected = true
				that.duration.visible = true
				that.selectDuration.selected = true
			} else{
				that.settings.forEach(function(setting){
					// console.log('setting ', setting)
					if(setting.name === user.subject._id){
						if(setting.timer === true){
							// console.log('timer true')
							that.timer.visible = true
							that.selectTimer.selected = true
						} else{
							that.timer.visible = false
							that.selectTimer.selected = false
						}
						if(setting.duration === true){
							that.duration.visible = true
							that.selectDuration.selected = true
						} else{
							// console.log('duration false')
							that.duration.visible = false
							that.selectDuration.selected = false
						}
						if(setting.in && setting.in !== 0){
							// console.log('setting.in')
							that.fp_options['defaultDate'] = setting.in
						}
					} else{
						that.timer.visible = true
						that.selectTimer.selected = true
						that.duration.visible = true
						that.selectDuration.selected = true
					}
				})
			}
		})
	}

	this.setTimer = function(){
		var that = this
		return this.api.User.current().then(function(user){
			console.log('setTimer start ', that.settings.length)
			var firstTimer = function(){
				var fields = that.optionsObservee.subject
				var data = {}
				data[fields.subfields.nameField] = user.subject._id
				data[fields.subfields.timerInputField] = that.selectTimer.selected
				that.ticket.get(that.settingsField).push(data)
			}

			if(that.settings.length === 0){
				console.log('timer length 0')
				firstTimer()
			} else{
				that.settings.forEach(function(setting, index){
					if(setting.name === user.subject._id){
						console.log('timer found user')
						that.settingsFieldObservee.set([index,'timer'], !setting.timer)
					} else{
						console.log('timer no user')
						firstTimer()
					}
				})
			}
			console.log('setTimer done ', that.settings)
		})
	}

	this.setDuration = function(){
		var that = this
		return this.api.User.current().then(function(user){
			console.log('setDuration start ', that.settings)
			var firstDuration = function(){
				var fields = that.optionsObservee.subject
				var data = {}
				data[fields.subfields.nameField] = user.subject._id
				data[fields.subfields.durationInputField] = that.selectDuration.selected
				that.ticket.get(that.settingsField).push(data)
			}

			if(that.settings.length === 0){
				console.log('duration length 0')
				firstDuration()
			} else{
				that.settings.forEach(function(setting, index){
					if(setting.name === user.subject._id){
						console.log('timer found user')
						that.settingsFieldObservee.set([index,'duration'], !setting.duration)
					} else{
						console.log('duration no user')
						firstDuration()
					}
				})
			}
			console.log('setDuration done ', that.settings)
		})
	}

	this.getStyle = function(){
		return Style({
			$div: {
				display: 'block',
				padding: 10,
				width: '100%',
				backgroundColor:'yellow'
			},
			Image: {
				width: '5%',
				marginLeft: '95%'
			},
			$error: {
				color: 'red',
				display: 'block'
			},
			Table: {
				TableCell: {
					borderBottom: '1px solid black',
					textAlign: 'center',
					width: 150
				},
				display: 'block',
				marginBottom: 10
			},
			$total: {
				fontWeight: 'bold',
				marginBottom: 10
			},
			$close: {
				display: 'block',
				backgroundColor: 'rgb(52, 152, 219)',
				color: 'white',
				fontWeight: 'bold',
				borderRadius: 5
			},
			Button: {
				backgroundColor: 'rgb(52, 152, 219)',
				color: 'white',
				fontWeight: 'bold',
				borderRadius: 5

			}
		})
	}
}))