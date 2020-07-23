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
  
* !$watches
  * If a user uses this command, they can see all the watches that they have set.
  * Will also display the date you created the watches and the date they expire

# Features to add
