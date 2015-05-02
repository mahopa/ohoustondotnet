using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web.Http;
using Autofac;
using Autofac.Integration.WebApi;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(OHouston.Web.Startup))]

namespace OHouston.Web
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
            var builder = new ContainerBuilder();

            //define services etc here for constructor injection
            //builder.Register(c => new RedisService()).As<IRedisService>().SingleInstance();
            //builder.Register(c => new SmsService()).As<IIdentityMessageService>().SingleInstance();


            var config = new HttpConfiguration();

            WebApiConfig.Register(config);

            builder.RegisterApiControllers(Assembly.GetExecutingAssembly());

            var container = builder.Build();
            config.DependencyResolver = new AutofacWebApiDependencyResolver(container);


            app.UseAutofacMiddleware(container);
            app.UseAutofacWebApi(config);
            app.UseWebApi(config);
        }
    }
}
