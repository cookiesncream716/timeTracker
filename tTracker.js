var flatpickr = require('flatpickr')

registerPlugin(proto(Gem, function(){
	this.name = 'TimeTracker'



	// set ticket field options 
	this.initialize = function(options){
		return{
			checkInField: 'checkIn',
			checkOutField: 'checkOut',
			timeWorkedField: 'timeWorked',
			userField: 'user'
		}
	}

	this.build = function(ticket, optionsObservee, api){
		var that = this
		this.ticket = ticket
		this.api = api
		this.optionsObservee = optionsObservee
		this.checkIn = TextField()
		this.checkOut = TextField()
		this.workedText = Text()
		this.workedText.visible = false
		var errMessage = Text('error', 'x')
		errMessage.visible = false
		var box = Block('div', Text('Start Time: '), this.checkIn, Text(' End Time: '), this.checkOut, errMessage, this.workedText)
		this.add(box)

		// get access if there is already a check-in time
		var inProperty = optionsObservee.subject.checkInField
		this.getIn = ticket.get(inProperty)

		// Check-In Time
		if(this.getIn.subject === undefined){
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
			var fp_in = new flatpickr(this.checkIn.domNode, {
				enableTime: true,
				dateFormat: 'm-d-Y h:i K',
				defaultDate: this.getIn.subject,
				minuteIncrement: 1,
				maxDate: 'today',
				onClose: function(){
					that.setIn()
				}
			})
		}

		// Check-Out Time
		var fp_out = new flatpickr(this.checkOut.domNode, {
			enableTime: true,
			dateFormat: 'm-d-Y h:i K',
			minuteIncrement: 1,
			maxDate: 'today',
			onClose: function(){
				if(that.checkOut.val == '' || new Date(that.checkOut.val).getTime() < new Date(that.getIn.subject).getTime()){
					errMessage.text = 'Your End Time must be later than your Start Time'
					errMessage.visible = true
					that.checkOut.val = ''
				} else{
					errMessage.visible = false
					that.calculateTime()
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

	// convert check-in time to milliseconds and save it
	this.setIn = function(){
		this.ticket.set(this.optionsObservee.subject.checkInField, new Date(this.checkIn.val))
	}

	// find how long worked and save out/timeWorked/user
	this.calculateTime = function(){
		var that = this
		var tWorked = new Date(that.checkOut.val).getTime() - new Date(this.getIn.subject).getTime()
		var hours = Math.floor(tWorked/1000/60/60)
		var rTime = tWorked - hours*1000*60*60
		var minutes = Math.floor(rTime/1000/60)
		this.workedText.text = 'You worked ' + hours + ' hours and ' + minutes + ' minutes.'
		this.workedText.visible = true
		// setTimeout(function(){
		// 	that.workedText.visible = true
		// }, 3000)
		this.ticket.set(this.optionsObservee.subject.checkOutField, new Date(this.checkOut.val))
		// timeWorked is in milliseconds so need to do math to convert to hours/minutes when displayed
		this.ticket.set(this.optionsObservee.subject.timeWorkedField, tWorked)
		tWorked = 0
		// get the current user
		this.api.User.current().then(function(user){
			that.currentUser = user.subject._id
		}).done()
		this.ticket.set(this.optionsObservee.subject.userField, this.currentUser)
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