# Tixit: timeTracker

![Example of TimeTracker](https://github.com/cookiesncream716/timeTracker/blob/master/tTracker.png?raw=true)

This is a plugin for [Tixit](https://tixit.me/) that allows users to record the time they spend working on a ticket. A user can choose from two options of how to record their time. 
1. You can use it like a timer, entering a start and stop time, or 
2. you can just enter the total minutes worked on a particular day. 

If you input a start time, that time will be saved so you can come back and input a stop time. It will also display a table showing a summary of how long each user worked on what days, as well as total time spent on the ticket as a whole.

This plugin has the following configuration options:

* ***`timesWorkedField`*** - The name of the compound field to store the list of work durations. 
* ***`subfields`*** - An object containing the names of sub-fields to the `timesWorkedField`:
  * ***`userField`*** - The name of the sub-field used to store the user `_id` of the user recording their time.
  * ***`checkInField`*** - The name of the sub-field used to store the check in time.
  * ***`checkOutField`*** - The name of the sub-field used to store the check out time.
  * ***`dateField`*** - The name of the sub-field used to store the date a user worked a number of minutes.
  * ***`minWorkedField`*** - The name of the sub-field used to store the number of minutes worked at a given date.  
* ***`tempInField`*** - The field used to store the start time so the user can check-in, work on the ticket, and then enter the stop time.

The field specified by the `timesWorkedField` option will be a compound list, where each object has an associated `user` and will either have `checkIn` and `checkOut` times or will have a `date` and a number of minutes worked (the `minWorked` field).

Required ticket schema fields (names based on the default configuration options):
|     Name    |   Type   | List | Editiable | Choices | Required |
|:-----------:|:--------:|:----:|:---------:|:-------:|:--------:|
| timesWorked | compound |   X  |     X     |         |          |

Subfields of `timesWorked`:
|     Name    |   Type   | List |  Editiable | Choices | Required |
|:-----------:|:--------:|:----:|:----------:|:-------:|:--------:|
|     user    |   text   |      |      X     |         |          |
|   checkIn   |  integer |      |      X     |         |          |
|   checkOut  |  integer |      |      X     |         |          |
|  minWorked  |  integer |      |      X     |         |          |
|     date    |  integer |      |      X     |         |          |
|    tempIn   |  integer |      |      X     |         |          |


### License
Released under the MIT license: [http://opensource.org/license/MIT](http://opensource.org/license/MIT)
