
using Act.Core;
using Foundation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Metabase
{
    public class MetaEntry
    {
		protected static dynamic cfg { get; set; }
		public static void Start(dynamic settings)
		{
			log.Register(new ConsoleLogManager());
			cfg = settings;
			log.i($"Meta module loaded");
		}
		public static void Stop()
		{
			log.i($"Meta module unloaded");
		}
	}
}
