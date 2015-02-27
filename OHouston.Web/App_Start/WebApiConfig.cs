using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Metadata;
using System.Web.Http.Validation;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json.Serialization;

namespace OHouston.Web
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.Services.Replace(typeof(IBodyModelValidator), new PrefixlessBodyModelValidator(config.Services.GetBodyModelValidator()));
            // Web API configuration and services
            // Configure Web API to use only bearer token authentication.
            config.SuppressDefaultHostAuthentication();
            config.Filters.Add(new HostAuthenticationFilter(OAuthDefaults.AuthenticationType));

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
        }
    }
    public class PrefixlessBodyModelValidator : IBodyModelValidator
    {
        private readonly IBodyModelValidator _innerValidator;

        public PrefixlessBodyModelValidator(IBodyModelValidator innerValidator)
        {
            if (innerValidator == null)
            {
                throw new ArgumentNullException("innerValidator");
            }

            _innerValidator = innerValidator;
        }

        public bool Validate(object model, Type type, ModelMetadataProvider metadataProvider, HttpActionContext actionContext, string keyPrefix)
        {
            // Remove the keyPrefix but otherwise let innerValidator do what it normally does.
            return _innerValidator.Validate(model, type, metadataProvider, actionContext, String.Empty);
        }
    }
}
