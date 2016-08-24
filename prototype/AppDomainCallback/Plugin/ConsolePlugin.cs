﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AppDomainContracts;

namespace Plugin
{
	[Serializable]
    public class ConsolePlugin : AppDomainComponent
    {
	    public override void Start()
	    {
			Console.WriteLine($"Console plugin:{AppDomain.CurrentDomain.FriendlyName}");
		}
	}
}
