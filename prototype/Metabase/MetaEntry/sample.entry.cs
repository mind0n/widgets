using Act.Core;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Act.Infrastructure;
using Foundation;

namespace Act.Entry
{
	/// <summary>
	/// Please modify module.act.json (will be generated in non-library project such as console application project or windows application project)
	///	from	"pattern": "Act.Entry.dll",
	/// to		"pattern": "Current assembly (.dll)",
	/// </summary>
	public class SampleEntry
	{
		
		public static void Start(dynamic settings)
		{
			log.Register(new ConfigLogManager());
			log.d($"Module started: SampleEntry - {AppDomain.CurrentDomain.FriendlyName} -> {settings.test}");
		}

		public static void Stop()
		{
			log.d($"Module ended: SampleEntry - {AppDomain.CurrentDomain.FriendlyName}");
		}
	}
}
