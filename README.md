# ohoustondotnet
  @ohoustondotnet on twitter
  
  shout out to http://ohouston.org/

**Goals**<br/>
This project is meant to create a solid starting platform for projects in the Open Houston initiative. Please feel free to make improvements.
<hr/>
Working sample here: <a href="http://ohoustondotnet.azurewebsites.net" target="_blank">There is no SSL set up for this site, so do not use sensitive passwords.</a>
<br>
<hr/>
<h4>Features</h4>
<ul>
<li>MVC5 website</li>
<li>Oauth2 and backend pre-configured</li>
<li>Entity Framework migrations initialized <small>just run the command "update database" to start</li>
<li>AngularJS 1.3</li>
<li>Angular UI Router</li>
<li>basic view transition animations</li>
<li>registration/login functionality complete in UI</li>
<li>angular templates and controllers seeded with boilerplate</li>
<li>MVC-like server side modelstate form validation via gbModelState directive and template /partials/misc/ModelState.html </li>
<li>Automatic cache-busting versioning. Check HomeController for where we define the version and how we make our router aware of the version when requesting partial view templates.</li>
<li>CORS is set up in a turnkey manner so your project can quickly become a public facing re-usable API for others.</li>
</ul>
<br/>
<p>
One thing that might not be super obvious about this project is that it is pretty much fully prepped to be the server side back end for a mobile app with OAuth2. It has the authentication infrastructure to allow a device to safely make api calls and provides the html/javascript code needed on the client side to do so. 
</p>
<br/>
<h3>Remaining goals</h3>
<ul>
<li>Server side unit tests.</li>
<li>Client side unit tests.</li>
</ul>
<br/>
<h3>Requires Visual Studio 2013 SDK in order to fully build solution. Download it here https://www.microsoft.com/en-us/download/details.aspx?id=40758 </h3>