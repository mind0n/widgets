using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;
using Act.Repository;
using AppDomainContracts;
using System.Threading;

namespace Startup
{
	partial class Program
	{
		static void Main(string[] args)
		{
			Console.WriteLine(AppDomain.CurrentDomain.FriendlyName);
			var rp = new FolderRepository(new
			{
				name="Container",
				basedir=AppDomain.CurrentDomain.BaseDirectory,
				pattern="addin.dll"
			});
			rp.Load();
			Console.WriteLine("Press any key to unload ...");
			Console.ReadKey();
			rp.Unload();
			Console.WriteLine("Press any key to exit ...");
			Console.ReadKey();

			//HappyPath();
			//Test();
		}

	}
}
