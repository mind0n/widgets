using Act.Repositories;
using Act.Services;
using Foundation;
using System;
using System.ServiceModel;

namespace Act.Entry
{
	public class ActEntry
	{
		static dynamic cfg { get; set; }
		static HttpWebServer server { get; set; }
		public static void Start(dynamic settings)
		{
			cfg = settings;

			server = new HttpWebServer(settings);

			try
			{
				server.Start();
			}
			catch (Exception ex)
			{
				log.e(ex);
			}
		}

		public static void Stop()
		{
			server.Stop();
		}
	}

	public class ActMgmtEntry
	{
		static dynamic cfg { get; set; }
		static NamedPipeHost host { get; set; }
		public static void Start(dynamic settings)
		{
			cfg = settings;

			var hostSettings = new NamedPipeHostSettings();
			hostSettings.ServiceType = typeof(Act.Repositories.AppDomainManager);
			hostSettings.ContractType = typeof(IAppDomainManager);
			hostSettings.Address = AppDomain.CurrentDomain.FriendlyName;
			hostSettings.Binding = new NetNamedPipeBinding();
			hostSettings.Uris.Add(new Uri("net.pipe://localhost"));
			host = new NamedPipeHost(hostSettings);

			try
			{
				host.Start();
			}
			catch (Exception ex)
			{
				log.e(ex);
			}
		}

		public static void Stop()
		{
			host.Stop();
		}
	}
}
