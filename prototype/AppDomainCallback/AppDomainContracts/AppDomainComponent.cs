using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AppDomainContracts
{
	[Serializable]
	public abstract class AppDomainComponent
	{
		public abstract void Start();
	}
}
