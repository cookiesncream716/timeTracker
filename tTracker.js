var proto = require('proto')
var Gem = require('gem')

var flatpickr = require('https://unpkg.com/flatpickr/dist/flatpickr.min.css')

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
		this.add(checkIn)
	}
}))