using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Act.Repository
{
    public class AppDomains
    {
        static ConcurrentDictionary<string, AppDomainAdapter> cache { get; } = new ConcurrentDictionary<string, AppDomainAdapter>();

        public static AppDomainAdapter Use(string name)
        {
            AppDomainAdapter ad = null;
            if (!cache.ContainsKey(name))
            {
                var dm = AppDomain.CreateDomain(name, AppDomain.CurrentDomain.Evidence);
                ad = new AppDomainAdapter(dm);
                cache[name] = ad;
            }
            ad = cache[name];
            return ad;
        }

        public static AppDomainAdapter Require(string name, int timeout = 0)
        {
            var dt = DateTime.Now;
            while (!cache.ContainsKey(name))
            {
                Thread.Sleep(1000);
                if (timeout > 0)
                {
                    var ts=  DateTime.Now - dt;
                    if (ts.TotalMilliseconds > timeout)
                    {
                        return null;
                    }
                }
            }
            return cache[name];
        }

        public static void Unload(string name)
        {
            if (cache.ContainsKey(name))
            {
                AppDomainAdapter o = null;
                while (!cache.TryRemove(name, out o))
                {
                    Thread.Sleep(100);
                }
            }
        }
    }

    public class AppDomainAdapter
    {
        protected AppDomain dm;
        public string BaseDirectory { get { return dm.BaseDirectory; } }
        public string SearchDirectory { get { return dm.RelativeSearchPath; } }
        public string Name { get { return $"{dm.Id}_{dm.FriendlyName}"; } }
        public AppDomainAdapter(AppDomain domain)
        {
            dm = domain;
        }
    }
}
