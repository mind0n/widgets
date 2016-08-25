using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;
using AppDomainContracts;

namespace Startup
{
	class Program
	{
		static void Main(string[] args)
		{
			Console.WriteLine(AppDomain.CurrentDomain.FriendlyName);
			var domain = AppDomain.CreateDomain("Container", AppDomain.CurrentDomain.Evidence, AppDomain.CurrentDomain.BaseDirectory, AppDomain.CurrentDomain.BaseDirectory, false);
            DoCallback(domain);

			//CreateAndUnwrap(domain);

			Console.WriteLine("Press any key to unload ...");
			Console.ReadKey();
			AppDomain.Unload(domain);

			Console.WriteLine("Press any key to exit ...");
			Console.ReadKey();

		}

		private static void DoCallback(AppDomain domain)
		{
			domain.DoCallBack(() =>
			{
				//var handle = Activator.CreateInstance(dll, "Addin.ConsoleAddin");
				var typ = Type.GetType("Addin.ConsoleAddin,addin", false, true);
				if (typ != null)
				{
					var ins =
						Activator.CreateInstance(typ, BindingFlags.Default, null, Type.EmptyTypes, CultureInfo.InvariantCulture) as AppDomainComponent;
					if (ins != null)
					{
						ins.Start();
					}
				}
			});
		}

		private static void CreateAndUnwrap(AppDomain domain)
		{
			var dll = AppDomain.CurrentDomain.BaseDirectory + "plugin.dll";
			var handle = domain.CreateInstanceFrom(dll, "Plugin.ConsolePlugin");
			var ins = (AppDomainComponent) handle.Unwrap();
			ins.Start();
		}
	}

	class Data
	{
		
	}
}
