
Description
In this project, we designed and implemented a relational database system to support the operations of an online auction system. We used React for the user interface, MySQL for the database server, and Springboot for connectivity between the user interface and database server.

Built With
React
Springboot
Apache Tomcat
MYSQL Workbench
Eclipse
Java

Features Implemented
End-users (buyers and sellers)
They are able to create and delete accounts, and login and logout.
An end-user can search the list of items on auction according to various criteria based on the fields describing an item.
Potential buyers are able to set alerts for items they are interested in buying.
A user is able to view the history of bids for any specific auction, the list of all auctions a specific buyer or seller has participated in, the list of "similar" items on auction in the preceding month (and auction information about them).
Customer representatives
Customer reps are available to end-users for answering questions, and modifying any information, as long as the customer rep decides this is reasonable.
This includes resetting passwords and removing bids. So your system need not support any specific rules for removing bids.
They can therefore be able to perform such actions, as well as removing illegal auctions.
One administrative staff member
One admin whose account will have been created ahead of time, is be able to create accounts for customer representatives.
This person is also be able to generate summary sales reports, including: total earnings; earnings per { item, item type, end-user}; best- selling {items, end-users}.

Setup
This is an example of how you may give instructions on setting up your project locally. To get a local copy up and running follow these simple example steps.

Installation
Install Eclipse Java EE IDE for Springboot backend and VS code for frontend
Clone the repo accordingly in both the environment and the localhost port should match as that given in maven properties
Clone the repo locally on Eclipse and VS code
git clone https://github.com/pradhyumna91/CS--527.git
Install Apache Tomcat
Configure the settings for Runtime Environment - Server - Add Runtime Environment - Add Apache Tomcat 7.0
Project Directory Contents

Run
Right-click on the project and click on Run As - Run on Server
