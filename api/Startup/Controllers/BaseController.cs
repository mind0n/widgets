using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;

namespace Startup.Controllers
{
    public class BaseController : Controller
    {
        protected IHostingEnvironment env { get; }

        public BaseController(IHostingEnvironment env)
        {
            this.env = env;
        }
        /// <summary>
        /// Writes a log entry to the local file system
        /// </summary>
        /// <param name="message">Message to be written to the log file</param>
        /// <param name="InsertNewLine">Inserts a new line</param>
        protected void WriteLog(string message)
        {
            Console.WriteLine(message);
        }
    }
}