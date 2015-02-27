# ohoustondotnet
  @ohoustondotnet on twitter
  
  shout out to http://ohouston.org/

This project is meant to create a solid starting platform for projects in the Open Houston initiative. Please feel free to make improvements.


Sample here: <a href="http://ohoustondotnet.azurewebsites.net" target="_blank">http://ohoustondotnet.azurewebsites.net</a>
<h3>There is no SSL, so do not use sensitive passwords.</h3>
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
</ul>
<br/>
<p>
One thing that might not be super obvious about this project is that it is pretty much fully prepped to be the server side back end for a mobile app with OAuth2. It has the authentication infrastructure to allow a device to safely make api calls and provides the html/javascript code needed on the client side to do so. 
</p>
<p>
But, this still does need to have CORS functionality enabled to allow cross domain authentication and api calls. Will update that soon.
</p>
