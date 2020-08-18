# BAPCSWatcher

BAPCSWatcher is a discord bot that users can add to their servers.
While the bot is in a server, users can tell the bot to watch for incoming deals posted to www.reddit.com/r/buildapcsales. Users will be notified of specific deals that they've set a notification for.

The type of deal to lookout for will be based on a combination of things to lookout for set by the user including:

* Part (gpu, cpu, etc.)
* Brand (EVGA, Silicon Power)
* Price ( <$100)
* Product specifications (DDR4, 1Tb, etc.)

All commands are prefixed with !$

# Commands

* !$watch \<type\> \<minimum price\> \<Other specs\> \<Expiration date\>(optional) 
  * Type stands for one of the product types on the sidebar of the subreddit
  * Minimum price will be the threshold that triggers an alert.
  * Other specs can be brand, product specifications, or other search terms, with all of the search terms separated by colons.
  * The date parameter allows the user to set an expiration date for the watch in the format DD/MM/YYYY. If no date is set, the watch will expire in 30 days.
  * Example: !$watch PSU $100 Seasonic:650W 07/4/2012
  * You can choose to forgo any of the fields by simply replacing it with \'\-\'
  * For example, !$watch cpu - - will alert you for any deal that is about a cpu.
  
* !$watches
  * If a user uses this command, they can see all the watches that they have set.
  * Will also display the ID of each watch and the date they expire

* !$delete <id>
  * Deletes a specific watch the user has based on the ID
  * Users can only delete their own watches
  * To get an ID, call the watches command
