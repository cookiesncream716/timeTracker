# Tixit: timeTracker

![Example of TimeTracker](https://github.com/cookiesncream716/timeTracker/blob/master/tTracker.png?raw=true)

This is a plugin for [Tixit](https://tixit.me/) which allows users to record the time they have spent working on a ticket. They are able to choose from two options of how to recore their time. They can use it like a timer, entering a start and stop time, or just enter the total minutes worked on a particular day. If the user inputs a start time, it will be saved until he returns to input a stop time. It will also display a table showing which users worked which days for how long and show how much total time has been worked for that ticket.

This plugin has a configuration field `timesWorkedField` that stores a list of `timesWorked` which holds three values, depending on the user's method of input. The `timesWorked` field has five subfields: `userField: user`, `checkInField: checkIn`, `checkOutField: checkOut`, `minWorkedField: minWorked`, and `dateField: date`. They needed to be added as subfields in the ticket schema. The plugin also has an configuration field `tempInField: tempIn` that is used to store the start time so the user can check-in, work on the ticket, and then enter the stop time. Below is a table which shows what values the properties need for each field in the ticket schema.


|     Name    |   Type   | List | Initial Value | Editiable | Choices | Required |
|:-----------:|:--------:|:----:|:-------------:|:---------:|:-------:|:--------:|
| timesWorked | compound |   X  |               |     X     |         |          |
|     user    |   text   |      |      none     |     X     |         |          |
|   checkIn   |  integer |      |      none     |     X     |         |          |
|   checkOut  |  integer |      |      none     |     X     |         |          |
|  minWorked  |  integer |      |      none     |     X     |         |          |
|     date    |  integer |      |      none     |     X     |         |          |
|    tempIn   |  integer |      |      none     |     X     |         |          |


### License
Released under the MIT license: [http://opensource.org/license/MIT](http://opensource.org/license/MIT)