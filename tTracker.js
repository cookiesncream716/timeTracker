'use strict'
var flatpickr = require('flatpickr')

registerPlugin(proto(Gem, function(){
	this.name = 'TimeTracker'

	// set ticket field options
	this.initialize = function(options){
		return{
			timesWorkedField: 'timesWorked',
			subfields: {
				userField: 'user',
				checkInField: 'checkIn',
				checkOutField: 'checkOut',
				minWorkedField: 'minWorked',
				dateField: 'date'
			},
			tempInField: 'tempIn',
			subfields: {
				nameField: 'name',
				inField: 'in'
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
		result[options.tempInField] = {
			type: 'compound',
			list: true,
			fields: {
				name: {type: 'choice', choices: 'Users'},
				in: {type: 'integer'}
			}
		}
		return result		
	}

	this.build = function(ticket, optionsObservee, api){
		this.ticket = ticket
		this.api = api
		this.optionsObservee = optionsObservee
		this.tWorkedField = optionsObservee.subject.timesWorkedField
		this.tempInField = optionsObservee.subject.tempInField
		var that = this

		// Timer
		this.checkIn = TextField()
		this.checkOut = TextField()
		this.workedText = Text()
		this.workedText.visible = false
		var errMessage = Text('error', 'Your End Time must be later than your Start Time')
		errMessage.visible = false
		var timer = Block('div', Text('Start Time: '), this.checkIn, Text(' End Time: '), this.checkOut, errMessage, this.workedText)

		// Duration
		var minutes = TextField()
		var date = TextField()
		var errorMessage = Text('error', 'Minutes Worked must be a number and Date cannot be empty')
		errorMessage.visible = false
		var success = Text('Your Time Has Been Recorded')
		success.visible = false
		var duration = Block('div', Text('Minutes Worked: '), minutes, Text(' Date: '), date, errorMessage, success)

		// Table
		var openButton = Button('Work History')
		var closeButton = Button('close', 'close')
		closeButton.visible = false
		var table = Table()
		table.visible = false
		var tableText = Text('total', 'time worked')
		tableText.visible = false
		var showTable = Block('div', openButton, table, tableText, closeButton)	

		// ??? put an if/else to add either timer or duration depending on user setting
		this.add(timer, duration, showTable)

		// if(ticket.get(this.tWorkedField).subject === undefined){
		// 	ticket.set(this.tWorkedField, [])
		// } 

		// Timer - flatpickr options
		var fp_options = {
			enableTime: true,
			dateFormat: 'm-d-Y h:i K',
			minuteIncrement: 1,
			maxDate: 'today',
			defaultDate: null,
			onClose: function(){
				that.storeIn()
			}
		}

		// Timer - checkIn Time
		// check to see if user is in tempInField
		ticket.get(this.tempInField).splice(0,2)
		console.log('tempInField ', ticket.get(this.tempInField))
		if(ticket.get(this.tempInField).subject.length > 0){
			console.log('checking for user in tempIn')
			api.User.current().then(function(user){
				console.log(ticket.get(that.tempInField).subject)
				var inSubject = ticket.get(that.tempInField).subject
				inSubject.forEach(function(sub){
					if(user.subject._id === sub.name){
						fp_options['defaultDate'] = new Date(sub.in)
						console.log('match ', fp_options['defaultDate'])
					}
				})
				// ??? will it work as for loop so can break out of it ???
				// for(var i=0; i<ticket.get(that.tempInField).subject.length; i++){
				// 	console.log('i = ', i, ' ', ticket.get(that.tempInField).subject[i].name)
				// 	if(user.subject._id === ticket.get(that.tempInField).subject[i].name){
				// 		fp_options['defaultDate'] = new Date(ticket.get(that.tempInField).subject[i].in)
				// 		console.log('match ', fp_options['defaultDate'])
				// 		break
				// 	}
				// }
			}).done()
			// fp_options['defaultDate'] = new Date(ticket.get(optionsObservee.subject.tempInField).subject)
		}
		var fp_in = new flatpickr(this.checkIn.domNode, fp_options)

		// Timer - checkOut Time
		var fp_out = new flatpickr(this.checkOut.domNode, {
			enableTime: true,
			dateFormat: 'm-d-Y h:i K',
			minuteIncrement: 1,
			maxDate: 'today',
			onClose: function(){
				// need to get tempIn time for current user then compare it to checkOut.val
				api.User.current().then(function(curUser){
					var index = -1
					var inSubject = ticket.get(that.tempInField).subject
					inSubject.forEach(function(sub, i){
						if(curUser.subject._id === sub.name){
							index = i
						}
					})
					console.log('index = ', index)
					console.log(ticket.get(that.tempInField).subject)
					if(index === -1){
						console.log('if')
						errMessage.visible = true
						that.checkOut.val = ''
					} else if(that.checkOut.val == '' || new Date(that.checkOut.val).getTime() < ticket.get(that.tempInField).subject[index].in){
						console.log('else if')
						errMessage.visible = true
						that.checkOut.val = ''
					} else{
						console.log('else')
						errMessage.visible = false
						that.saveTime(index)
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
						// need to delete user in in tempInField
					}).done()
				}
			}
		})

		// Table
		openButton.on('click', function(){
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
			}).done()
			table.visible = true
			tableText.visible = true
			closeButton.visible = true
			openButton.visible = false
			duration.visible = false
			timer.visible = false

		})
		closeButton.on('click', function(){
			table.visible = false
			tableText.visible = false
			closeButton.visible = false
			openButton.visible = true
			duration.visible = true
			timer.visible = true
			table.remove(table.children)
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
		var that = this
		// this.ticket.set(this.optionsObservee.subject.tempInField, new Date(this.checkIn.val).getTime())
		console.log('in storeIn')
		return this.api.User.current().then(function(curUser){
			var fields = that.optionsObservee.subject
			var info = {}
			info[fields.subfields.nameField] = curUser.subject._id
			info[fields.subfields.inField] = new Date(that.checkIn.val).getTime()
			that.ticket.get(that.tempInField).push(info)
			console.log('storeIn tempIn= ' , that.ticket.get(that.tempInField))
		})
	}

	// Timer - find how long worked and save everything to ticket
	this.saveTime = function(index){
		console.log('saveTime ', index)
		var that = this
		// var msWorked = new Date(that.checkOut.val).getTime() - this.ticket.get(this.optionsObservee.subject.tempInField).subject
		var msWorked = new Date(that.checkOut.val).getTime() - this.ticket.get(this.tempInField).subject[index].in
		var hours = Math.floor(msWorked/1000/60/60)
		msWorked -= hours*1000*60*60
		var minutes = Math.floor(msWorked/1000/60)
		this.workedText.text = 'You worked ' + hours + ' hours and ' + minutes + ' minutes.'
		this.workedText.visible = true
		setTimeout(function(){
			that.workedText.visible = false
		}, 5000)
		return this.api.User.current().then(function(user){
			console.log('api.User')
			var fields = that.optionsObservee.subject
			var stats = {}
			stats[fields.subfields.userField] = user.subject._id
			stats[fields.subfields.checkInField] = that.ticket.get(that.tempInField).subject[index].in
			stats[fields.subfields.checkOutField] = new Date(that.checkOut.val).getTime()
			that.ticket.get(that.tWorkedField).push(stats)
			that.checkIn.val = ''
			that.checkOut.val = ''
			// that.ticket.set(that.optionsObservee.subject.tempInField, undefined)
			ticket.get(that.tempInField).splice(index, 1)
			console.log('timesWorkedField ', that.ticket.get(that.tWorkedField))
			console.log('tempInField ', that.ticket.get(that.tempInField))
		})
	}

	this.getStyle = function(){
		return Style({
			$div: {
				display: 'block',
				padding: 10,
				// fontFamily: 'Open Sans, sans-serif'
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
				// make backgroundColor match Tixit's blue
				backgroundColor: 'rgb(52, 152, 219)',
				color: 'white',
				fontWeight: 'bold',
				borderRadius: 5

			}
		})
	}
}))