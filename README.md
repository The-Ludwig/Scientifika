Scientifika
===========
[Live Demo](https://the-ludwig.github.io/Scientifika)
The new Scientifika webpage is being constructed here right now. 
At Scientifika you can enjoy fun scientific talks on Fridays at 16:00 with delicious Swedish pastries. 
The talks are generally directed towards any interested student or senior. 
Scientifika is organized by the [Oscar Klein Centre](http://www.okc.albanova.se/).
Hosted on [Github Pages](https://pages.github.com/), build with [Jekyll](https://jekyllrb.com/), using the CSS framework [Bootstrap](https://getbootstrap.com/) and theme inspired by the [Toucan theme](https://www.getzola.org/themes/toucan/).


# Updating the Webpage
Copy an old post in the `_posts` folder and update the information. 
Then create a pull request here on Github, this can be done in Github's web interface, or locally (see next section).

# Local Development
(Knowledge in command line usage and with git advisable.)

## Required Sofware
You need a browser (doo...) and ruby. Follow the [installation instruction for jekyll](https://jekyllrb.com/docs/installation/), for example on Ubuntu:
```bash
sudo apt install ruby-full build-essential zlib1g-dev
```
and then install `jekyll` and `bundler`
```bash
gem install jekyll bundler
```

## Hosting the webpage locally
Clone the repository 
```bash
git clone github.com/The-Ludwig/Scientifika
```
change to it's cloned directory
```bash
cd Scientifika
```
tell ruby to install plugins ('gems') locally
```bash
bundle config set --local path '.bundle'
```
install the required ruby packages
```bash
bundle install
```
and start the server locally 
```bash 
bundle exec jekyll serve
```
You can now go to [http://localhost:4000/](http://localhost:4000/) on your local browser and start developing locally.
