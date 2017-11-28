# Tixit: timeTracker

![Example of TimeTracker](https://github.com/cookiesncream716/timeTracker/blob/master/TimeTracker.png?raw=true)

This is a plugin for [Tixit](https://tixit.me/) that allows users to record the time they spend working on a ticket. A user can choose from two options of how to record their time. 
1. You can use it like a timer, entering a start and stop time, or 
2. you can just enter the total minutes worked on a particular day. 

If you input a start time, that time will be saved so you can come back and input a stop time. It will also display a table showing a summary of how long each user worked on what days, as well as total time spent on the ticket as a whole.

This plugin has the following configuration options:

* ***`timesWorkedField`*** - The name of the compound field to store the list of work durations.
* ***`settingsField`*** - The name of the compound field to store the input settings and temporarily store the start time. 
* ***`subfields`*** - An object containing the names of sub-fields to the `timesWorkedField` and `settingsField`:
  * ***`userField`*** - The name of the sub-field of `timesWorkedField` used to store the user `_id` of the user recording their time.
  * ***`checkInField`*** - The name of the sub-field of `timesWorkedField` used to store the check in time.
  * ***`checkOutField`*** - The name of the sub-field of `timesWorkedField` used to store the check out time.
  * ***`dateField`*** - The name of the sub-field of `timesWorkedField` used to store the date a user worked a number of minutes.
  * ***`minWorkedField`*** - The name of the sub-field of `timesWorkedField` used to store the number of minutes worked at a given date.
  * ***`nameField`*** - The name of the sub-field of `settingsField` used to store the user `_id` of the user recording their settings and start time.
  * ***`inField`*** - The name of the sub-field of `settingsField` used to store the starting time so the user can check-in, work on a ticket, and then enter the stop time.
  * ***`timerInputField`*** - The name of the sub-field of `settingsField` used to store either true or false, depending on whether the user has chosen the input method of a start/stop time or not.
  * ***`durationInputField`*** - The name of the sub-field of `settingsField` used to store either true or false, depending on whether the user has chosen to input time worked as a number of minutes or not. 

The field specified by the `timesWorkedField` option will be a compound list, where each object has an associated `user` and will either have `checkIn` and `checkOut` times or will have a `date` and a number of minutes worked (the `minWorked` field).

The field specified by the `settingsField` option will also be a compound list, where each object has an associateted `name`  and may have an `in` time, `timer` input setting, or `duration` input setting.

Required ticket schema fields (names based on the default configuration options):

|     Name    |   Type   | List | Initial Value | Editable | Choices | Required |
|:-----------:|:--------:|:----:|:-------------:|:--------:|:-------:|:--------:|
| timesWorked | compound |   X  |               |     X    |         |          |
|   settings  | compound |   X  |               |     X    |         |          |

Subfields of `timesWorked`:

|    Name   |   Type  | List | Initial Value | Editable | Choices | Required |
|:---------:|:-------:|:----:|:-------------:|:--------:|:-------:|:--------:|
|    user   | choice  |      |      none     |     X    |   User  |          |
|  checkIn  | integer |      |      none     |     X    |         |          |
|  checkOut | integer |      |      none     |     X    |         |          |
| minWorked | integer |      |      none     |     X    |         |          |
|    date   | integer |      |      none     |     X    |         |          |

Subfields of `settings`:

|   Name   |   Type  | List | Initial Value | Editable |    Choices    | Required |
|:--------:|:-------:|:----:|:-------------:|:--------:|:-------------:|:--------:|
|   name   |  choice |      |               |     X    |     Users     |          |
|    in    | integer |      |               |     X    |               |          |
| timer    | choice  |      |               |     X    | [true, false] |          |
| duration | choice  |      |               |     X    | [true, false] |          |


For more information about Tixit plugins go here: [http://docs.tixit.me/d/Plugin_API](http://docs.tixit.me/d/Plugin_API).

### License
Released under the MIT license: [https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT)
