var flatpickr = require('flatpickr')

registerPlugin(proto(Gem, function(){
	this.name = 'TimeTracker'

	// set ticket field options
	// this.initialize = function(options){
	// 	return{
	// 		checkInField: 'checkIn',
	// 		checkOutField: 'checkOut',
	// 		timeWorkedField: 'timeWorked',
	// 		userField: 'user'
	// 	}
	// }

	this.build = function(ticket, optionsObservee, api){
		var that = this
		this.ticket = ticket

		// get access if there is already a check-in time
		var inProperty = optionsObservee.subject.checkInField

		// get the current user
		api.User.current().then(function(user){
			that.currentUser = user.subject._id
			console.log('user = ' + that.currentUser)
		}).done()

		// Check-In Time
		this.checkIn = TextField()
		if(ticket.get(inProperty).subject === undefined){
			var fp_in = new flatpickr(this.checkIn.domNode, {
				enableTime: true,
				dateFormat: 'm-d-Y h:i K',
				minuteIncrement: 1,
				maxDate: 'today',
				onClose: function(){
					that.setIn()
				}
			})
		} else{
			console.log('set to '+ ticket.get(inProperty).subject)
			this.checkIn.val = ticket.get(inProperty).subject
			this.setIn()
			var fp_in = new flatpickr(this.checkIn.domNode, {
				enableTime: true,
				dateFormat: 'm-d-Y h:i K',
				defaultDate: ticket.get(inProperty).subject,
				minuteIncrement: 1,
				// maxDate: 'today',
				onClose: function(){
					that.setIn()
				}
			})
		}

		// Check-Out Time
		var errMessage = Text('error', 'x')
		errMessage.visible = false
		this.workedText = Text()
		this.workedText.visible = false
		this.checkOut = TextField()
		var fp_out = new flatpickr(this.checkOut.domNode, {
			enableTime: true,
			dateFormat: 'm-d-Y h:i K',
			minuteIncrement: 1,
			maxDate: 'today',
			onClose: function(){
				var y = that.checkOut.val
				that.mOut = new Date(y).getTime()
				if(y == '' || that.mOut < that.mIn){
					errMessage.text = 'Your End Time must be later than your Start Time'
					errMessage.visible = true
					that.checkOut.val = ''
				} else{
					errMessage.visible = false
					that.calculateTime()
					// setTimeout(that.workedText.visible = true, 1000)
					// that.workedText.visible = false
					setTimeout(function(){
						that.workedText.visible = true, 500
					})
					that.workedText.visible = false
				}
			}
		})

		var box = Block('div', Text('Start Time: '), this.checkIn, Text(' End Time: '), this.checkOut, errMessage, this.workedText)
	// Don't think the buttons are needed on actual Tixit site
		// var button = Button('timeTracker')
		// var button2 = Button('close')
		// button2.visible = false
		// this.add(button, button2, box)
		this.add(box)
		// button.on('click', function(){
		// 	// box.visible = true
		// 	box2.visible = true
		// 	button.visible = false
		// 	button2.visible = true
		// })
		// button2.on('click', function(){
		// 	box2.visible = false
		// 	button.visible = true
		// 	button2.visible = false
		// })

		// css stylesheet for flatpickr
		this.on('attach', function(){
		var flatpickrStylesheet = require('raw-loader!flatpickr/dist/flatpickr.min.css')
		var style = document.createElement('style')
		style.innerHTML = flatpickrStylesheet
		document.head.appendChild(style)
		})
	}

	// convert check-in time to milliseconds and save it
	this.setIn = function(){
		var ms = this.checkIn.val
		this.mIn = new Date(ms).getTime()
		this.ticket.set('checkIn', new Date(this.checkIn.val))
		console.log('mIn=' + this.mIn)
		console.log(this.checkIn.val)
		console.log(new Date(this.checkIn.val))
	}

	// find how long worked and save out/time worked/user
	this.calculateTime = function(){
		// var that = this
		var diff = this.mOut - this.mIn
		var hours = Math.floor(diff/1000/60/60)
		diff -= hours*1000*60*60
		var minutes = Math.floor(diff/1000/60)
		this.workedText.text = 'You worked ' + hours + ' hours and ' + minutes + ' minutes.'
		// this.workedText.visible = true
		// setTimeout(function(){
		// 	that.workedText.visible = true
		// }, 3000)
		this.ticket.set('checkOut', new Date(this.checkOut.val))
		// timeWorked is in milliseconds so need to do math to convert to hours/minutes when displayed
		this.ticket.set('timeWorked', diff)
		this.ticket.set('user', this.currentUser)
		this.checkIn.val = ''
		this.checkOut.val = ''
	}
	this.getStyle = function(){
		return Style({
			$div: {
				display: 'block'
			},
			$error: {
				color: 'red',
				display: 'block'
			}
		})
	}
}))