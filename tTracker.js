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
			}
		}
	}


	this.build = function(ticket, optionsObservee, api){
		this.ticket = ticket
		this.api = api
		this.optionsObservee = optionsObservee
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
		var errorMessage = Text('error', 'Minutes Worked and Date cannot be empty')
		errorMessage.visible = false
		var success = Text('Your Time Has Been Recorded')
		success.visible = false
		var duration = Block('div', Text('Minutes Worked: '), minutes, Text(' Date: '), date, errorMessage, success)

		// put an if/else to add either timer or duration depending on user setting?
		this.add(timer, duration)


		var tWorkedField = optionsObservee.subject.timesWorkedField

		if(ticket.get(tWorkedField).subject === undefined){
			ticket.set(tWorkedField, [])
			this.times = ticket.get(tWorkedField).subject
		} else{
			this.times = ticket.get(tWorkedField).subject
		}
		console.log('1 ', tWorkedField)

		// Timer - checkIn Time
		// var fp_options = {
		// 	enableTime: true,
		// 	dateFormat: 'm-d-Y h:i K',
		// 	minuteIncrement: 1,
		// 	maxDate: 'today',
		// 	defaultDate: null,
		// 	onClose: function(){
		// 		that.setIn()
		// 	}
		// }
		// if(this.getIn.subject === undefined){
		// 	var fp_in = new flatpickr(this.checkIn.domNode, fp_options)
		// } else{
		// 	fp_options.defaultDate = this.getIn.subject
		// 	var fp_in = new flatpickr(this.checkIn.domNode, fp_options)
		// }

		// Timer - checkOut Time
		// var fp_out = new flatpickr(this.checkOut.domNode, {
		// 	enableTime: true,
		// 	dateFormat: 'm-d-Y h:i K',
		// 	minuteIncrement: 1,
		// 	maxDate: 'today',
		// 	onClose: function(){
		// 		if(that.checkOut.val == '' || new Date(that.checkOut.val).getTime() < that.getIn.subject){
		// 			errMessage.visible = true
		// 			that.checkOut.val = ''
		// 		} else{
		// 			errMessage.visible = false
		// 			that.calculateTime()
		// 		}
		// 	}
		// })

		// Duration
		var fp_duration = new flatpickr(date.domNode, {
			dateFormat: 'm-d-Y',
			maxDate: 'today',
			onClose: function(){
				// need to check that this.minutes.val is a number
				if(date.val == '' || minutes.val ==''){
					errorMessage.visible = true
				} else{
					errorMessage.visible = false
					// ticket.set(optionsObservee.subject.subfields.dateField, new Date(date.val).getTime())
					// to save timeWorked in minutes
					// ticket.set(optionsObservee.subject.subfields.minWorkedField, minutes.val)
					// to save timeWorked in milliseconds
					// ticket.set(optionsObservee.subject.timeWorkedField, minutes.val*1000*60)
					api.User.current().then(function(curUser){
						that.currUser = curUser.subject._id
					})
					// ticket.set(optionsObservee.subject.subfields.userField, that.currUser)

					var data = {
						'userField': that.currUser,
						'dateField': new Date(date.val).getTime(),
						'minWorkedField': minutes.val
					}
					// need to get rid of that.times and push data directly into tWorkedField
					that.times.push(data)
					console.log('2 ', ticket.get(tWorkedField).subject)
					// ticket.set(tWorkedField, ticket.get(tWorkedField).push(data))
					ticket.set(tWorkedField, that.times)
					success.visible = true
					setTimeout(function(){
						success.visible = false
					}, 3000)
					minutes.val = ''
					date.val = ''
					console.log('user = ' + ticket.get(tWorkedField).subject[0].userField)
				}
			}
		})

		// css stylesheet for flatpickr
		this.on('attach', function(){
			var flatpickrStylesheet = require('raw-loader!flatpickr/dist/flatpickr.min.css')
			var style = document.createElement('style')
			style.innerHTML = flatpickrStylesheet
			document.head.appendChild(style)
		})
	}

	// Timer - convert check-in time to milliseconds and save it
	// this.setIn = function(){
	// 	this.ticket.set(this.optionsObservee.subject.subfields.checkInField, new Date(this.checkIn.val).getTime())
	// }

	// Timer - find how long worked and save out/timeWorked/user
	// this.calculateTime = function(){
	// 	var that = this
	// 	var tWorked = new Date(that.checkOut.val).getTime() - new Date(this.getIn.subject)
	// 	var hours = Math.floor(tWorked/1000/60/60)
	// 	tWorked -= hours*1000*60*60
	// 	var minutes = Math.floor(tWorked/1000/60)
	// 	this.workedText.text = 'You worked ' + hours + ' hours and ' + minutes + ' minutes.'
	// 	this.workedText.visible = true
	// 	setTimeout(function(){
	// 		that.workedText.visible = false
	// 	}, 5000)
	// 	this.ticket.set(this.optionsObservee.subject.subfields.checkOutField, new Date(this.checkOut.val).getTime())
	// 	this.api.User.current().then(function(user){
	// 		that.currentUser = user.subject._id
	// 	}).done()
	// 	this.ticket.set(this.optionsObservee.subject.subfields.userField, this.currentUser)
	// 	this.checkIn.val = ''
	// 	this.checkOut.val = ''
	// }

	this.getStyle = function(){
		return Style({
			$div: {
				display: 'block',
				padding: 10
			},
			$error: {
				color: 'red',
				display: 'block'
			}
		})
	}
}))