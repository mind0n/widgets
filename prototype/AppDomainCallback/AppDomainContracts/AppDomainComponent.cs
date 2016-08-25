﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AppDomainContracts
{
	public abstract class AppDomainComponent : MarshalByRefObject
	{
		public abstract void Start();
	}
}
