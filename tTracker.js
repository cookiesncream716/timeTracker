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
		var errorMessage = Text('error', 'Minutes Worked must be a number and Date cannot be empty')
		errorMessage.visible = false
		var success = Text('Your Time Has Been Recorded')
		success.visible = false
		var duration = Block('div', Text('Minutes Worked: '), minutes, Text(' Date: '), date, errorMessage, success)

		// Table
		var openButton = Button('table')
		var closeButton = Button('close', 'close')
		closeButton.visible = false
		var table = Table()
		table.visible = false
		var showTable = Block('div', openButton, table, closeButton)

		this.tWorkedField = optionsObservee.subject.timesWorkedField		

		// ??? put an if/else to add either timer or duration depending on user setting
		this.add(timer, duration, showTable)

		if(ticket.get(this.tWorkedField).subject === undefined){
			ticket.set(this.tWorkedField, [])
		} 

		// Timer - flatpickr options (not sure variable is necessary anymore)
		var fp_options = {
			enableTime: true,
			dateFormat: 'm-d-Y h:i K',
			minuteIncrement: 1,
			maxDate: 'today',
			// defaultDate: null,
			// not sure onClose is needed since everything is done onClose of checkOut
			onClose: function(){
				// that.setIn()
				that.inTime = new Date(that.checkIn.val).getTime()
				// ??? save it until data is saved to ticket and then reset it to undefined
			}
		}

		// Timer - checkIn Time
		// if(this.getIn.subject === undefined){
		// 	var fp_in = new flatpickr(this.checkIn.domNode, fp_options)
		// } else{
		// 	fp_options.defaultDate = this.getIn.subject
		// 	var fp_in = new flatpickr(this.checkIn.domNode, fp_options)
		// }
		var fp_in = new flatpickr(this.checkIn.domNode, fp_options)

		// Timer - checkOut Time
		var fp_out = new flatpickr(this.checkOut.domNode, {
			enableTime: true,
			dateFormat: 'm-d-Y h:i K',
			minuteIncrement: 1,
			maxDate: 'today',
			onClose: function(){
				if(that.checkOut.val == '' || new Date(that.checkOut.val).getTime() < new Date(that.checkIn.val).getTime()){
					errMessage.visible = true
					that.checkOut.val = ''
				} else{
					errMessage.visible = false
					that.saveTime()
				}
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
					// is it better to put this in a separate function outside of build?
					api.User.current().then(function(curUser){
						that.currUser = curUser.subject._id
					})
					var data = {
						'userField': that.currUser,
						'dateField': new Date(date.val).getTime(),
						'minWorkedField': minutes.val
					}
					ticket.get(that.tWorkedField).push(data)
					success.visible = true
					setTimeout(function(){
						success.visible = false
					}, 3000)
					minutes.val = ''
					date.val = ''
				}
			}
		})

		// Table
		openButton.on('click', function(){
			table.header(['USER', 'DATE', 'MINUTES'])
			// ??? get rid of var row
			var rows = ticket.get(that.tWorkedField).subject
			for(var i=0; i<rows.length; i++){
				api.User.load(ticket.get(that.tWorkedField).subject[i].userField).then(function(user){
					that.userName = user[0].displayName()
				}).done()
				if(ticket.get(that.tWorkedField).subject[i].checkInField === undefined){
					table.row([
						Text(that.userName),
						Text((new Date(rows[i].dateField).getMonth()+1) + '-' + new Date(rows[i].dateField).getDate() + '-' + new Date(rows[i].dateField).getFullYear()),
						Text(rows[i].minWorkedField)
					])
				} else{
					table.row([
						Text(that.userName),
						Text((new Date(rows[i].checkInField).getMonth()+1) + '-' + new Date(rows[i].checkInField).getDate() + '-' + new Date(rows[i].checkInField).getFullYear()),
						Text((new Date(rows[i].checkOutField) - new Date(rows[i].checkInField))/1000/60)
					])
				}
			}
			table.visible = true
			closeButton.visible = true
			openButton.visible = false

		})
		closeButton.on('click', function(){
			table.visible = false
			closeButton.visible = false
			openButton.visible = true
			table.remove(table.children)
			// need to empty table so it doesn't keep duplicating
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

	// Timer - find how long worked and save everything to ticket
	this.saveTime = function(){
		var that = this
		var msWorked = new Date(that.checkOut.val).getTime() - that.inTime
		var hours = Math.floor(msWorked/1000/60/60)
		msWorked -= hours*1000*60*60
		var minutes = Math.floor(msWorked/1000/60)
		this.workedText.text = 'You worked ' + hours + ' hours and ' + minutes + ' minutes.'
		this.workedText.visible = true
		setTimeout(function(){
			that.workedText.visible = false
		}, 5000)
		this.api.User.current().then(function(user){
			that.currentUser = user.subject._id
		}).done()
		var info = {
			'userField': this.currentUser,
			'checkInField':  that.inTime,
			// 'checkInField': new Date(that.checkIn.val).getTime(),
			'checkOutField': new Date(that.checkOut.val).getTime()
		}
		this.ticket.get(this.tWorkedField).push(info)
		this.checkIn.val = ''
		this.checkOut.val = ''
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