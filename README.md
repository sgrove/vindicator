Node Crawler
========

*"A fun toy"*

Just a sample crawler to tell you if you have any dead links. Please keep in mind this is just an off-the-cuff project and not meant to represent any sort of good practices.

Installation
------------------

    git clone git://github.com/sgrove/nodespider.git
    npm install request
    npm install jsdom

Usage
------------------

    node crawl.js http://news.ycombinator.com

TODO (In no order)
------------------

 1. Add credentials for basic auth to be able to crawl behind protected sites as well.
 2. Setup connection pooling
 3. Make it "work" :)
  
Thanks
------
[Veks][1] - For his node mastery and help


  [1]: http://github.com/kevzettler


