'use client';
import "@/app/globals.css";
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Briefcase,
  IndianRupee,
  TrendingUp,
  MapPin,
  Calendar,
  Info,
  RefreshCw,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

const COLORS = ["#10b981", "#ef4444"];

export default function DistrictDashboard() {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedDistrictName, setSelectedDistrictName] = useState("");
  const [currentData, setCurrentData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState({});
  const [detectedLocation, setDetectedLocation] = useState("");
  const [locationDetecting, setLocationDetecting] = useState(false);

  useEffect(() => {
    fetchDistricts();
    attemptLocationDetection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDistricts = async () => {
    try {
      const response = await fetch("/api/districts");
      if (!response.ok) throw new Error("Failed to fetch districts");
      const data = await response.json();
      setDistricts(data);
    } catch (err) {
      console.error("Error loading districts:", err);
      setError("Failed to load districts list");
    }
  };

  const attemptLocationDetection = () => {
    if ("geolocation" in navigator) {
      setLocationDetecting(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch("/api/location", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              setDetectedLocation(data.name);
              setSelectedDistrict(data.district_code);
            }
          } catch (err) {
            console.error("Location detection failed:", err);
          } finally {
            setLocationDetecting(false);
          }
        },
        () => {
          console.log("Location access denied or unavailable");
          setLocationDetecting(false);
        },
        { timeout: 10000 }
      );
    }
  };

  useEffect(() => {
    if (selectedDistrict) fetchDistrictData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDistrict]);

  const fetchDistrictData = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentResponse = await fetch(`/api/district/${selectedDistrict}`);
      if (!currentResponse.ok) throw new Error("Failed to fetch current data");
      const current = await currentResponse.json();
      setCurrentData(current);

      const district = districts.find(
        (d) => d.district_code === selectedDistrict
      );
      if (district) setSelectedDistrictName(district.name);

      const historicalResponse = await fetch(
        `/api/district/${selectedDistrict}?historical=true&months=12`
      );
      if (!historicalResponse.ok)
        throw new Error("Failed to fetch historical data");
      const historical = await historicalResponse.json();

      const formatted = historical.map((d) => ({
        month: new Date(d.month).toLocaleDateString("en-IN", {
          month: "short",
        }),
        workers: d.activeWorkers,
        expenditure: d.totalExpenditure,
        personDays: d.personDaysGenerated,
        totalWorkers: d.totalWorkers,
      }));

      setHistoricalData(formatted);
    } catch (err) {
      console.error("Error loading district data:", err);
      setError("Failed to load district data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleInfo = (key) =>
    setShowInfo((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleRefresh = () => {
    if (selectedDistrict) fetchDistrictData();
  };

  const InfoCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color,
    infoKey,
    explanation,
  }) => (
    <div
      className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 ${color} overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`p-4 rounded-xl ${color
              .replace("border-", "bg-")
              .replace(
                "500",
                "100"
              )} transform group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className={`w-7 h-7 ${color.replace("border-", "text-")}`} />
          </div>
          <button
            onClick={() => toggleInfo(infoKey)}
            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            aria-label={`Info about ${title}`}
          >
            <Info className="w-4 h-4 text-blue-600" />
          </button>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
          )}
        </div>
      </div>

      {showInfo[infoKey] && (
        <div className="px-6 pb-6">
          <div className="p-4 bg-blue-50 rounded-xl text-sm text-gray-700 border-l-4 border-blue-500">
            {explanation}
          </div>
        </div>
      )}
    </div>
  );

  // District selection screen
  if (!selectedDistrict) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-teal-50 relative overflow-hidden grid place-items-center">
        {/* Decorative background elements - responsive sizes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none ">
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-green-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tr from-blue-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-2xl !mx-auto !px-4 sm:!px-6 !py-8 sm:!py-12 md:!py-20 relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl !p-5 sm:!p-8 md:!p-10 border border-white/50 transform hover:scale-[1.01] transition-all duration-300">
            <div className="text-center !mb-8 sm:!mb-10">
              {/* Logo/Icon - responsive sizing */}
              <div className="!mb-6 sm:!mb-8 relative">
                <div className="inline-block relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl sm:rounded-2xl blur-lg sm:blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative !p-4 sm:!p-6 bg-gradient-to-br from-green-400 via-emerald-500 to-blue-500 rounded-xl sm:rounded-2xl shadow-2xl transform hover:rotate-3 transition-transform duration-300">
                    <MapPin
                      className="w-12 h-12 sm:w-16 sm:h-16 text-white drop-shadow-lg"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent !mb-2 sm:!mb-3 leading-tight !px-2">
                मनरेगा जिला डैशबोर्ड
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-700 !mb-4 sm:!mb-6 font-bold tracking-tight !px-2">
                MGNREGA District Dashboard
              </p>

              {/* Location Detection */}
              {locationDetecting && (
                <div className="inline-flex items-center gap-2 sm:gap-3 text-blue-700 !mb-4 sm:!mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 !px-4 sm:!px-8 !py-3 sm:!py-4 rounded-full shadow-lg border border-blue-200 animate-pulse max-w-full">
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-lg">
                    आपका स्थान खोजा जा रहा है...
                  </span>
                </div>
              )}

              {detectedLocation && !locationDetecting && (
                <div className="inline-flex items-center gap-2 sm:gap-3 text-green-700 !mb-4 sm:!mb-6 bg-gradient-to-r from-green-50 to-emerald-50 !px-4 sm:!px-8 !py-3 sm:!py-4 rounded-full shadow-lg border border-green-200 animate-bounce-slow max-w-full">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 fill-green-600 text-green-600 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-lg break-words">
                    आपका स्थान:{" "}
                    <strong className="text-green-800">
                      {detectedLocation}
                    </strong>
                  </span>
                </div>
              )}

              <p className="text-gray-600 text-base sm:text-lg font-medium !px-2">
                अपना जिला चुनें / Select Your District
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="!mb-4 sm:!mb-6 !p-4 sm:!p-5 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl flex items-start sm:items-center gap-2 sm:gap-3 text-red-700 shadow-md">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="font-semibold text-sm sm:text-base break-words">
                  {error}
                </span>
              </div>
            )}

            {/* District Selector */}
            <div className="relative !mb-6 sm:!mb-8">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full appearance-none !p-4 sm:!p-5 text-base sm:text-lg border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300 bg-white font-semibold hover:border-green-400 hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 pr-12"
                disabled={districts.length === 0}
              >
                <option value="">
                  {districts.length === 0
                    ? "लोड हो रहा है... / Loading..."
                    : "जिला चुनें / Select District"}
                </option>
                {districts.map((district) => (
                  <option key={district.id} value={district.district_code}>
                    {district.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-500 pointer-events-none" />
            </div>

            {/* Info Box */}
            <div className="!p-5 sm:!p-7 bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 rounded-xl sm:rounded-2xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="font-bold text-green-900 !mb-3 sm:!mb-4 flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                <div className="!p-1.5 sm:!p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <Info className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" />
                </div>
                <span>मनरेगा क्या है?</span>
              </h3>
              <p className="text-sm sm:text-base text-green-900 leading-relaxed font-medium">
                महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी योजना (MGNREGA)
                भारत सरकार की एक योजना है जो ग्रामीण क्षेत्रों में{" "}
                <span className="font-bold text-green-700">
                  100 दिन का गारंटीशुदा रोजगार
                </span>{" "}
                प्रदान करती है। यह डैशबोर्ड आपको अपने जिले में इस योजना के
                प्रदर्शन की जानकारी देता है।
              </p>
            </div>

            {/* Footer */}
            <div className="!mt-6 sm:!mt-8 text-center">
              <div className="inline-flex items-center gap-2 !px-4 sm:!px-6 !py-2.5 sm:!py-3 bg-gradient-to-r from-orange-100 to-green-100 rounded-full border-2 border-white shadow-md">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-bold text-gray-700">
                  भारत सरकार की पहल
                </span>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
    @keyframes bounce-slow {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
    .animate-bounce-slow {
      animation: bounce-slow 2s ease-in-out infinite;
    }
    @media (max-width: 640px) {
      select {
        font-size: 14px;
      }
    }
    html {
      -webkit-overflow-scrolling: touch;
    }
  `}</style>
      </div>
    );
  }

  // Loading screen
  if (loading || !currentData) {
    return (
      <div className="!min-h-screen !bg-gradient-to-br !from-green-50 !via-blue-50 !to-purple-50 flex !items-center !justify-center">
        <div className="text-center !p-10">
          <div className="relative !mb-8">
            <div className="!w-20 !h-20 !border-8 !border-green-200 !border-t-green-500 !rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="!text-2xl !font-bold !text-gray-700 !mt-4">
            डेटा लोड हो रहा है...
          </p>
          <p className="!text-lg !text-gray-500 !mt-2">Loading data...</p>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 !p-5 text-center">
      <div className="!max-w-7xl !mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl !p-6 !mb-6 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-300 to-blue-300 rounded-full filter blur-3xl opacity-20"></div>

          <div className="flex flex-col items-center justify-between gap-4 relative z-10 text-center !m-[40px]">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {selectedDistrictName} जिला
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString("hi-IN", {
                  month: "long",
                  year: "numeric",
                })}{" "}
                /{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex gap-5">
              <button
                onClick={handleRefresh}
                className="!px-4 !py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold "
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">ताज़ा करें / Refresh</span>
              </button>

              <button
                onClick={() => {
                  setSelectedDistrict("");
                  setCurrentData(null);
                  setHistoricalData([]);
                }}
                className="!px-6 !py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                जिला बदलें / Change District
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="!mb-6 !p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 !mb-6">
          <InfoCard
            icon={Users}
            title="कुल कामगार / Total Workers"
            value={currentData.totalWorkers.toLocaleString("en-IN")}
            subtitle="रजिस्टर्ड श्रमिक / Registered"
            color="border-blue-500"
            infoKey="workers"
            explanation="यह आपके जिले में मनरेगा में पंजीकृत कुल कामगारों की संख्या है। ये वे लोग हैं जिनके पास जॉब कार्ड है और जो काम के लिए पात्र हैं।"
          />

          <InfoCard
            icon={Briefcase}
            title="सक्रिय कामगार / Active Workers"
            value={currentData.activeWorkers.toLocaleString("en-IN")}
            subtitle={`${Math.round(
              (currentData.activeWorkers / currentData.totalWorkers) * 100
            )}% कार्यरत / Active`}
            color="border-green-500"
            infoKey="active"
            explanation="इस महीने काम कर रहे कामगारों की संख्या। यह दर्शाता है कि कितने लोगों को वास्तव में रोजगार मिल रहा है। अधिक संख्या बेहतर कार्यान्वयन दर्शाती है।"
          />

          <InfoCard
            icon={IndianRupee}
            title="औसत मजदूरी / Avg Wage"
            value={`₹${currentData.averageWage.toFixed(0)}`}
            subtitle="प्रति दिन / per day"
            color="border-yellow-500"
            infoKey="wage"
            explanation="मनरेगा के तहत कामगारों को मिलने वाली प्रतिदिन की औसत मजदूरी। यह राज्य सरकार द्वारा निर्धारित की जाती है और समय-समय पर संशोधित होती है।"
          />

          <InfoCard
            icon={TrendingUp}
            title="कुल खर्च / Total Expenditure"
            value={`₹${currentData.totalExpenditure.toFixed(1)} Cr`}
            subtitle="इस महीने / This Month"
            color="border-red-500"
            infoKey="expenditure"
            explanation="इस महीने आपके जिले में मनरेगा पर किया गया कुल खर्च। इसमें मजदूरी भुगतान और सामग्री की लागत शामिल है।"
          />
        </div>

        {/* Work Completion & Person Days */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 !mb-6">
  {/* Work Completion Pie Chart */}
  <div className="bg-white rounded-2xl shadow-xl !p-6 border border-gray-100 hover:shadow-2xl transition-shadow">
    <div className="flex items-center justify-between !mb-4">
      <h2 className="text-xl font-bold text-gray-900">
        काम पूर्णता / Work Completion
      </h2>
      <button
        onClick={() => toggleInfo('completion')}
        className="!p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        <Info className="w-5 h-5 text-blue-600" />
      </button>
    </div>

    {showInfo.completion && (
      <div className="!mb-4 !p-3 bg-blue-50 rounded-xl text-sm text-gray-700 border-l-4 border-blue-500">
        यह दर्शाता है कि शुरू किए गए कामों में से कितने प्रतिशत काम पूरे हो चुके हैं।
        100% का मतलब सभी काम समय पर पूरे हुए। हरा रंग पूर्ण कार्य और लाल रंग लंबित कार्य दर्शाता है।
      </div>
    )}

    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={[
            { name: 'पूर्ण / Completed', value: currentData.workCompleted },
            { name: 'लंबित / Pending', value: 100 - currentData.workCompleted },
          ]}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          <Cell fill={COLORS[0]} />
          <Cell fill={COLORS[1]} />
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>

    <div className="!mt-4 text-center !p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
      <p className="text-4xl font-bold text-green-600">
        {currentData.workCompleted.toFixed(1)}%
      </p>
      <p className="text-sm text-gray-600 !mt-1">
        कार्य पूर्ण / Work Completed
      </p>
    </div>
  </div>

  {/* Person Days */}
  <div className="bg-white rounded-2xl shadow-xl !p-6 border border-gray-100 hover:shadow-2xl transition-shadow">
    <div className="flex items-center justify-between !mb-4">
      <h2 className="text-xl font-bold text-gray-900">
        व्यक्ति-दिवस / Person Days Generated
      </h2>
      <button
        onClick={() => toggleInfo('persondays')}
        className="!p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        <Info className="w-5 h-5 text-blue-600" />
      </button>
    </div>

    {showInfo.persondays && (
      <div className="!mb-4 !p-3 bg-blue-50 rounded-xl text-sm text-gray-700 border-l-4 border-blue-500">
        व्यक्ति-दिवस = कुल श्रमिकों की संख्या × काम के दिन। यह दर्शाता है कि कितने लोगों को कितने दिनों का रोजगार मिला। यह योजना के प्रभाव का महत्वपूर्ण संकेतक है।
      </div>
    )}

    <div className="space-y-4">
      <div className="flex items-center justify-between !p-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl shadow-lg">
        <div>
          <span className="text-white font-semibold block">
            इस महीने / This Month
          </span>
          <span className="text-sm text-green-100">व्यक्ति-दिवस उत्पन्न</span>
        </div>
        <span className="text-3xl font-bold text-white">
          {(currentData.personDaysGenerated / 100000).toFixed(2)}L
        </span>
      </div>

      <div className="flex items-center justify-between !p-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl shadow-lg">
        <div>
          <span className="text-white font-semibold block">जॉब कार्ड / Job Cards</span>
          <span className="text-sm text-blue-100">जारी किए गए</span>
        </div>
        <span className="text-3xl font-bold text-white">
          {currentData.jobCardsIssued.toLocaleString('en-IN')}
        </span>
      </div>

      <div className="!p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-semibold">औसत रोजगार दिवस</span>
          <span className="text-2xl font-bold text-purple-600">
            {(currentData.personDaysGenerated / currentData.activeWorkers).toFixed(0)} days
          </span>
        </div>
        <p className="text-xs text-gray-600 !mt-1">
          प्रति सक्रिय कामगार / Per active worker
        </p>
      </div>
    </div>
  </div>
</div>


        {/* Historical Trends */}
        {historicalData.length > 0 && (
          <>
            <div className="bg-white rounded-2xl shadow-xl !p-6 !mb-6 border border-gray-100 hover:shadow-2xl transition-shadow">
  <div className="flex items-center justify-between !mb-4">
    <h2 className="text-xl font-bold text-gray-900">
      पिछले 12 महीने का रुझान / Last 12 Months Trend
    </h2>
    <button
      onClick={() => toggleInfo('trend')}
      className="!p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
    >
      <Info className="w-5 h-5 text-blue-600" />
    </button>
  </div>

  {showInfo.trend && (
    <div className="!mb-4 !p-3 bg-blue-50 rounded-xl text-sm text-gray-700 border-l-4 border-blue-500">
      यह ग्राफ दिखाता है कि पिछले एक साल में आपके जिले में मनरेगा का प्रदर्शन कैसा रहा है।
      हरी रेखा कामगारों की संख्या और पीली रेखा खर्च दर्शाती है। ऊपर जाने का मतलब बेहतर प्रदर्शन।
    </div>
  )}

  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={historicalData}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
      <YAxis yAxisId="left" stroke="#10b981" style={{ fontSize: '12px' }} />
      <YAxis
        yAxisId="right"
        orientation="right"
        stroke="#f59e0b"
        style={{ fontSize: '12px' }}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
        }}
      />
      <Legend />
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="workers"
        stroke="#10b981"
        name="कामगार / Workers"
        strokeWidth={3}
        dot={{ fill: '#10b981', r: 4 }}
        activeDot={{ r: 6 }}
      />
      <Line
        yAxisId="right"
        type="monotone"
        dataKey="expenditure"
        stroke="#f59e0b"
        name="खर्च (Cr) / Expenditure"
        strokeWidth={3}
        dot={{ fill: '#f59e0b', r: 4 }}
        activeDot={{ r: 6 }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>


            {/* Monthly Comparison Bar Chart */}
            <div className="bg-white rounded-2xl shadow-xl !p-6 border border-gray-100 hover:shadow-2xl transition-shadow">
  <h2 className="text-xl font-bold text-gray-900 !mb-4">
    मासिक तुलना (पिछले 6 महीने) / Monthly Comparison (Last 6 Months)
  </h2>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={historicalData.slice(-6)}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis
        dataKey="month"
        stroke="#6b7280"
        style={{ fontSize: '12px' }}
      />
      <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
      <Tooltip
        contentStyle={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
        }}
      />
      <Legend />
      <Bar
        dataKey="workers"
        fill="#3b82f6"
        name="सक्रिय कामगार / Active Workers"
        radius={[8, 8, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
</div>

          </>
        )}

        {/* Footer */}
        <div className="dd-footer !mt-6 !p-6">
  <p className="text-sm text-slate-600">
    डेटा स्रोत: data.gov.in | अंतिम अपडेट:{" "}
    {new Date().toLocaleDateString("hi-IN")}
  </p>
  <p className="text-xs text-slate-500 !mt-2">
    यह डैशबोर्ड भारत सरकार के ओपन डेटा से तैयार किया गया है / This
    dashboard is built using Government of India's Open Data
  </p>
  <div className="!mt-4 flex justify-center gap-4 text-xs text-slate-500">
    <span className="dd-footer__badge">संस्करण / Version: 1.0.0</span>
    <span className="text-slate-300">•</span>
    <span className="dd-footer__badge">
      उत्तर प्रदेश / Uttar Pradesh
    </span>
  </div>
</div>

      </div>
    </div>
  );
}
