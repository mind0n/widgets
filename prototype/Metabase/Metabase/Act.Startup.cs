using Act.Core;
using Act.Infrastructure;
using Foundation;
using Native;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;

namespace Act
{
    class Startup
    {
        static void Main(string[] args)
		{
			log.Register(new ConfigLogManager());
			Cmd.Handle(args, ()=>
			{
				ServiceStartup ss = new ServiceStartup();
				if (Cmd.Exists("c") || Debugger.IsAttached)
				{
					ss.Begin();
					log.w("Press ENTER to stop server ...");
					Console.ReadLine();
					ss.End();
					log.w("Press any key to exit ...");
					Console.ReadKey();
				}
				else
				{
					ServiceBase[] svc = { ss };
					ServiceBase.Run(svc);
				}
			});

		}

		private static void Output(string msg)
        {
            File.WriteAllText(AppDomain.CurrentDomain.BaseDirectory + "output.txt", msg);
        }
    }
}
