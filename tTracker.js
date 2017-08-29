var proto = require('proto')
var Gem = require('gem')
var flatpickr = require('flatpickr')

// not sure these are necessare - they might already be available
var TextField = require('gem/TextField')
var Text = require('gem/Text')
var Block = require('gem/Block')
var Button = require('gem/Button')
var Style = require('gem/Style')

registerPlugin(proto(Gem, function(){
	
	this.name = 'TimeTracker'
	this.build = function(ticket, optionsObservee, api){
		this.add(Text('hi'))
		this.checkIn = TextField()
		var fp = new flatpickr(this.checkIn.domNode, {
			enableTime: true,
			dateFormat: 'm-d-Y h:i K',
			defaultDate: new Date()
		})
		this.add(this.checkIn)
		// var that = this
		// this.ticket = ticket

		// // get access if there is already a check-in time
		// var inProperty = optionsObservee.subject.checkInField
		// // var start = ticket.get(inProperty).subject

		// // get the current user
		// api.User.current().then(function(user){
		// 	that.currentUser = user.subject._id
		// }).done()

		// this.checkIn = TextField()
		// this.min
		// if(ticket.get(inProperty).subject === undefined){
		// 	this.checkIn.val = new Date()
		// 	this.setIn()
		// 	var fp_in = new flatpickr(this.checkIn.domNode, {
		// 		enableTime: true,
		// 		dateFormat: 'm-d-Y h:i K',
		// 		defaultDate: new Date(),
		// 		minuteIncrement: 1,
		// 		onClose: function(){
		// 			that.setIn()
		// 		}
		// 	})
		// } else{
		// 	this.checkIn.val = ticket.get(inProperty).subject
		// 	this.setIn()
		// 	var fp_in = new flatpickr(this.checkIn.domNode, {
		// 		enableTime: true,
		// 		dateFormat: 'm-d-Y h:i K',
		// 		defaultDate: ticket.get(inProperty).subject,
		// 		minuteIncrement: 1,
		// 		onClose: function(){
		// 			that.setIn()
		// 		}
		// 	})
		// }
		// var errMessage = Text('error', 'x')
		// errMessage.visible = false
		// this.checkOut = TextField()
		// var fp_out = new flatpickr(this.checkOut.domNode, {
		// 	enableTime: true,
		// 	dateFormat: 'm-d-Y h:i K',
		// 	minuteIncrement: 1,
		// 	maxDate: 'today',
		// 	onClose: function(){
		// 		var y = that.checkOut.val
		// 		that.mOut = new Date(y).getTime()
		// 		if(y == '' || that.mOut < that.mIn){
		// 			errMessage.text = 'Your End Time must be later than your Start Time'
		// 			errMessage.visible = true
		// 			that.checkOut.val = ''
		// 		} else{
		// 			errMessage.visible = false
		// 			that.calculateTime()
		// 		}
		// 	}
		// })

		// this.workedText = Text()
		// this.workedText.visible = false

		// var box = Text('div', 'Keep track of the time you are working.')
		// var box2 = Block('div', Text('Start Time: '), this.checkIn, Text(' End Time: '), this.checkOut, errMessage, this.workedText)
		// box.visible = false
		// box2.visible = false

		// var button = Button('timeTracker')
		// this.add(button, box, box2)

		// button.on('click', function(){
		// 	box.visible = true
		// 	box2.visible = true
		// 	// does button need hidden?
		// })

		// this.setIn = function(){
		// 	var ms = this.checkIn.val
		// 	this.mIn = new Date(ms).getTime()
		// 	this.ticket.set('checkIn', this.checkIn.val)
		// }
		// this.calculateTime = function(){
		// 	var diff = this.mOut - this.mIn
		// 	var hours = Math.floor(diff/1000/60/60)
		// 	diff -= hours*1000*60*60
		// 	var minutes = Math.floor(diff/1000/60)
		// 	this.workedText.text = 'You worked ' + hours + ' hours and ' + minutes + ' minutes.'
		// 	this.workedText.visible = true
		// 	this.ticket.set('checkOut', this.checkOut.val)
		// 	// timeWorked is in milliseconds so need to do math to convert to hours/minutes when displayed
		// 	this.ticket.set('timeWorked', diff)
		// 	this.ticket.set('user', this.currentUser)
		// }
		// this.getStyle = function(){
		// 	return Style({
		// 		$div: {
		// 			display: 'block'
		// 		},
		// 		$error: {
		// 			color: 'red',
		// 			display: 'block'
		// 		}
		// 	})
		// }
	}
}))