using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AppDomainContracts;

namespace Addin
{
	[Serializable]
    public class ConsoleAddin : AppDomainComponent
    {
	    public override void Start()
	    {
		    Console.WriteLine($"Console addin:{AppDomain.CurrentDomain.FriendlyName}");
	    }
    }
}
