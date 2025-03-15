import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Trash2,
  AlertCircle,
  X,
  Loader2,
  FileImage,
  Send,
  Maximize,
  Minimize,
  Cpu,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart2,
} from "lucide-react";

const MedicalAIScanner = () => {
  // States
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [expandedView, setExpandedView] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [lastContext, setLastContext] = useState("");

  const fileInputRef = useRef(null);
  const resultContainerRef = useRef(null);

  // Scroll to result when available
  useEffect(() => {
    if (result && resultContainerRef.current) {
      resultContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [result]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size should not exceed 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    setImage(file);
    setError("");
    setResult(null);
    setExplanation("");
    setChatHistory([]);
  };

  const clearImage = () => {
    setImage(null);
    setPreviewUrl("");
    setResult(null);
    setExplanation("");
    setChatHistory([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      setError("Please select an image to analyze");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create form data for the image
      const formData = new FormData();
      formData.append("file", image);

      // Send request to the backend for prediction
      const predictionResponse = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        body: formData,
      });

      if (!predictionResponse.ok) {
        throw new Error("Failed to analyze image");
      }

      const predictionData = await predictionResponse.json();

      // Set result
      setResult(predictionData);

      // Now get explanation from Ollama
      const explanationResponse = await fetch(
        "http://localhost:8000/ollama_query/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(predictionData),
        }
      );

      if (!explanationResponse.ok) {
        throw new Error("Failed to get explanation");
      }

      const explanationData = await explanationResponse.json();
      setExplanation(explanationData.response);
      setLastContext(explanationData.response);
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError(err.message || "An error occurred during analysis");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();

    if (!questionInput.trim()) return;

    const question = questionInput;
    setQuestionInput("");

    // Add user question to chat
    setChatHistory((prev) => [...prev, { isUser: true, content: question }]);

    try {
      const response = await fetch("http://localhost:8000/follow_up/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          context: lastContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();

      // Add AI response to chat
      setChatHistory((prev) => [
        ...prev,
        { isUser: false, content: data.response },
      ]);
    } catch (err) {
      console.error("Error getting answer:", err);
      setChatHistory((prev) => [
        ...prev,
        {
          isUser: false,
          content: "Sorry, I couldn't process your question at this time.",
        },
      ]);
    }
  };

  // Render confidence percentage with color
  const renderConfidence = (confidence) => {
    let color = "text-green-600";
    if (confidence < 0.7) color = "text-orange-500";
    if (confidence < 0.5) color = "text-red-500";

    return (
      <span className={`font-bold ${color}`}>
        {(confidence * 100).toFixed(2)}%
      </span>
    );
  };

  return (
    <div
      className={`bg-gray-50 min-h-screen transition-all duration-300 ${
        expandedView ? "p-0" : "p-6"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto bg-white shadow-sm rounded-xl overflow-hidden transition-all duration-300 ${
          expandedView ? "rounded-none" : ""
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <Cpu className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Medical X-Ray Analysis</h1>
              <p className="text-sm opacity-80">
                AI-powered tuberculosis detection for chest X-rays
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpandedView(!expandedView)}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            title={expandedView ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {expandedView ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row">
          {/* Left side - Upload & Image */}
          <div className="lg:w-1/2 p-6 border-r border-gray-100">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileImage className="w-5 h-5 text-indigo-500" />
                Upload X-Ray Image
              </h2>
              <p className="text-sm text-gray-500">
                Upload a chest X-ray image for tuberculosis screening
              </p>
            </div>

            {/* Upload area */}
            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-500 transition-colors"
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag & drop an X-ray image or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supports: JPEG, PNG, DICOM (max 10MB)
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-gray-900">
                <img
                  src={previewUrl}
                  alt="X-ray preview"
                  className="w-full object-contain max-h-[500px]"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={clearImage}
                    className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Select Image
              </button>
              <button
                onClick={analyzeImage}
                disabled={!image || loading}
                className={`flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors
                  ${
                    !image || loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-indigo-700"
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    Analyze Image
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right side - Results */}
          <div className="lg:w-1/2 p-6" ref={resultContainerRef}>
            {result ? (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-indigo-500" />
                    Analysis Results
                  </h2>
                  <p className="text-sm text-gray-500">
                    AI-powered detection results for the uploaded X-ray
                  </p>
                </div>

                {/* Result card */}
                <div className="mb-6 bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      Diagnosis
                    </h3>
                    <div className="px-4 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                      AI Generated
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    {result.class === "Normal" ? (
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    ) : (
                      <XCircle className="w-12 h-12 text-red-500" />
                    )}

                    <div>
                      <div className="text-2xl font-bold mb-1 flex items-center gap-2">
                        {result.class === "Normal" ? (
                          <span className="text-green-700">Normal</span>
                        ) : (
                          <span className="text-red-700">
                            Tuberculosis Detected
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600">
                        Confidence: {renderConfidence(result.confidence)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Medical Analysis
                    </h4>
                    <div className="text-gray-600 whitespace-pre-line">
                      {explanation || "Generating detailed analysis..."}
                    </div>
                  </div>
                </div>

                {/* Ask follow-up questions */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <h3 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-500" />
                    Ask Follow-up Questions
                  </h3>

                  {/* Chat messages */}
                  {chatHistory.length > 0 && (
                    <div className="mb-4 max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white">
                      {chatHistory.map((msg, index) => (
                        <div
                          key={index}
                          className={`mb-3 ${msg.isUser ? "text-right" : ""}`}
                        >
                          <div
                            className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                              msg.isUser
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Question input */}
                  <form onSubmit={handleQuestionSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={questionInput}
                      onChange={(e) => setQuestionInput(e.target.value)}
                      placeholder="Ask about these results..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!questionInput.trim()}
                      className={`px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2
                        ${
                          !questionInput.trim()
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-indigo-700"
                        }`}
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <Cpu className="w-10 h-10 text-indigo-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Analysis Yet
                </h3>
                <p className="text-gray-500 max-w-md">
                  Upload an X-ray image and click "Analyze Image" to get
                  detailed results and AI-powered diagnosis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalAIScanner;
