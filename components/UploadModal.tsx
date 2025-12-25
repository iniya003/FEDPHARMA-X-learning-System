import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Client, Optimizer, SubmissionType, ClientUploadState } from '../types';
import { UploadIcon, PackageIcon, SlidersIcon, CheckCircleIcon } from './icons/MiscIcons';

interface UploadModalProps {
  client: Client;
  onClose: () => void;
  onUpload: (state: Omit<ClientUploadState, 'isUploaded' | 'blockchainTxId' | 'isEthicallyCompliant'>) => void;
  initialState: Omit<ClientUploadState, 'isUploaded' | 'blockchainTxId' | 'isEthicallyCompliant'>;
}

const SuccessCheckmark = () => (
    <div className="scale-75">
        <svg className="checkmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
    </div>
);

const Spinner = () => (
    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ComplianceSpinner = () => (
    <div className="w-5 h-5 mr-3 flex-shrink-0">
        <svg className="animate-spin h-full w-full text-gray-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);


const ComplianceCheckItem = ({ name, isChecked }: { name: string; isChecked: boolean }) => (
    <li className="flex items-center transition-all duration-300">
        {isChecked ? (
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
        ) : (
            <ComplianceSpinner />
        )}
        <span className={`text-sm ${isChecked ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>{name} Compliant</span>
    </li>
);

export const UploadModal: React.FC<UploadModalProps> = ({ client, onClose, onUpload, initialState }) => {
  const [file, setFile] = useState<File | null>(initialState.file);
  const [optimizer, setOptimizer] = useState<Optimizer>(initialState.optimizer);
  const [submissionType, setSubmissionType] = useState<SubmissionType>(initialState.submissionType);
  const [version, setVersion] = useState<string>(initialState.version);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadComplete, setIsUploadComplete] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadIntervalRef = useRef<number | null>(null);

  const submissionTypeDetails = {
    [SubmissionType.FullModel]: {
      icon: PackageIcon,
      description: "Includes model architecture and weights.",
    },
    [SubmissionType.ParametersOnly]: {
      icon: SlidersIcon,
      description: "Includes only the trained model weights.",
    },
  };

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const acceptedTypes = ['.bin', '.model', '.h5'];
    setFileError(null); // Reset error on new file selection

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileName = selectedFile.name.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

      if (acceptedTypes.includes(fileExtension)) {
        setFile(selectedFile);
      } else {
        setFileError(`Invalid file type. Please use: ${acceptedTypes.join(', ')}`);
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Clear the file input
        }
        setFile(null); // Ensure no file is set in state
      }
    }
  };

  const handleFinalSubmit = useCallback(() => {
     if(file){
        onUpload({ file, optimizer, submissionType, version });
     }
  }, [file, onUpload, optimizer, submissionType, version]);

  const handleCancelUpload = () => {
    if (uploadIntervalRef.current) {
      clearInterval(uploadIntervalRef.current);
      uploadIntervalRef.current = null;
    }
    setIsUploading(false);
    setIsSubmitting(false);
    setUploadProgress(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && !fileError) {
      setIsSubmitting(true);
      
      // Short delay to allow user to see the button state change before view transition
      setTimeout(() => {
        setIsUploading(true);
        setUploadProgress(0);

        const intervalId = setInterval(() => {
          setUploadProgress(prev => {
            const newProgress = prev + 10;
            if (newProgress >= 100) {
              clearInterval(intervalId);
              uploadIntervalRef.current = null;
              setTimeout(() => {
                setIsUploadComplete(true);
                setIsSubmitting(false);
              }, 500); // Give time for the 100% to show
              return 100;
            }
            return newProgress;
          });
        }, 150); // Simulate upload speed
        uploadIntervalRef.current = intervalId as any;
      }, 400);

    } else if (!file) {
      setFileError('Please select a model file to upload.');
    }
  };
  
  const isActionInProgress = isSubmitting || isUploading || isUploadComplete;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300" onClick={isActionInProgress ? undefined : onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className={`p-4 rounded-t-xl ${client.darkColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <client.icon className="w-8 h-8 mr-3 text-white" />
              <h3 className="text-lg font-bold text-white">Upload for {client.name}</h3>
            </div>
            {!isActionInProgress && (
               <button onClick={onClose} className="text-white text-3xl leading-none font-bold opacity-70 hover:opacity-100">&times;</button>
            )}
          </div>
        </div>
        
        <div className="p-6">
           {isUploadComplete ? (
            <div className="text-center py-8 flex flex-col items-center">
                <SuccessCheckmark />
                <h4 className="text-lg font-semibold text-gray-800 mt-4 animate-fade-in">Upload Successful!</h4>
                <p className="text-sm text-gray-600 mt-1 animate-fade-in">Your contribution is ready for aggregation.</p>
                <div className="mt-8 w-full px-6">
                    <button 
                        onClick={handleFinalSubmit}
                        className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-md font-semibold text-white ${client.darkColor} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105`}
                    >
                        Confirm Contribution
                    </button>
                </div>
            </div>
          ) : isUploading ? (
            <div className="text-center py-8 flex flex-col items-center">
                <h4 className="text-lg font-semibold text-gray-700">Uploading Model...</h4>
                <p className="text-sm text-gray-500 mt-1 mb-6">Processing your contribution and running compliance checks.</p>
                
                <div className="w-full max-w-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-base font-medium text-gray-700">Upload Progress</span>
                        <span className={`text-base font-bold ${client.darkColor.replace('bg-','text-').replace('-600', '-600')}`}>
                            {uploadProgress}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300">
                        <div 
                            className={`${client.darkColor} h-full rounded-full transition-all duration-300 ease-linear progress-bar-striped`}
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                </div>
                
                 <div className="mt-8 w-full max-w-sm text-left p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h5 className="text-sm font-semibold text-gray-600 mb-4 text-center">Ethics & Compliance Checks</h5>
                    <ul className="space-y-3">
                        <ComplianceCheckItem name="HIPAA" isChecked={uploadProgress >= 30} />
                        <ComplianceCheckItem name="GDPR" isChecked={uploadProgress >= 60} />
                        <ComplianceCheckItem name="WHO Bioethics" isChecked={uploadProgress >= 90} />
                    </ul>
                </div>
                
                 <div className="mt-8">
                    <button
                        type="button"
                        onClick={handleCancelUpload}
                        className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                    >
                        Cancel Upload
                    </button>
                </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model File</label>
                  <div 
                      className={`mt-2 flex flex-col justify-center items-center py-20 px-6 bg-slate-50 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 hover:border-blue-500 hover:bg-slate-100 ${fileError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                      onClick={() => fileInputRef.current?.click()}
                  >
                      <div className="text-center">
                          <UploadIcon className="mx-auto h-20 w-20 text-gray-400 mb-4"/>
                          <p className="text-md text-gray-600">
                              {file ? 
                                  <span>Selected: <span className="font-semibold text-gray-800">{file.name}</span></span> : 
                                  <span><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</span>
                              }
                          </p>
                          <p className="text-sm text-gray-500 mt-1">Accepted file types: .bin, .model, .h5</p>
                          <input ref={fileInputRef} id={`file-upload-${client.id}`} name={`file-upload-${client.id}`} type="file" className="sr-only" onChange={handleFileChange} accept=".bin,.model,.h5" />
                      </div>
                  </div>
                  {fileError && <p className="mt-2 text-sm text-red-600">{fileError}</p>}
              </div>

              <div>
                <label htmlFor={`optimizer-${client.id}`} className="block text-sm font-medium text-gray-700">Optimizer</label>
                <select
                  id={`optimizer-${client.id}`}
                  name="optimizer"
                  value={optimizer}
                  onChange={(e) => setOptimizer(e.target.value as Optimizer)}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.values(Optimizer).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Submission Type</label>
                <fieldset className="mt-2">
                    <legend className="sr-only">Choose a submission type</legend>
                    <div className="space-y-3">
                        {(Object.values(SubmissionType) as SubmissionType[]).map((type) => {
                            const isSelected = submissionType === type;
                            const details = submissionTypeDetails[type];
                            const Icon = details.icon;
                            
                            return (
                            <label
                                key={type}
                                htmlFor={`submission-type-${type.replace(/\s/g, '')}-${client.id}`}
                                className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-all duration-200
                                ${isSelected ? 'border-blue-600 ring-2 ring-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                            >
                                <input
                                type="radio"
                                id={`submission-type-${type.replace(/\s/g, '')}-${client.id}`}
                                name="submission-type-choice"
                                value={type}
                                checked={isSelected}
                                onChange={() => setSubmissionType(type)}
                                className="sr-only"
                                aria-labelledby={`submission-type-${type.replace(/\s/g, '')}-label`}
                                aria-describedby={`submission-type-${type.replace(/\s/g, '')}-description`}
                                />
                                <div className="flex flex-1 items-center">
                                <Icon className={`h-8 w-8 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                                <div className="ml-4 flex flex-col">
                                    <span 
                                    id={`submission-type-${type.replace(/\s/g, '')}-label`} 
                                    className={`block text-md font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}
                                    >
                                    {type}
                                    </span>
                                    <span 
                                    id={`submission-type-${type.replace(/\s/g, '')}-description`} 
                                    className={`block text-sm ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}
                                    >
                                    {details.description}
                                    </span>
                                </div>
                                </div>
                                {isSelected && (
                                <CheckCircleIcon className="h-6 w-6 text-blue-600 ml-4" />
                                )}
                            </label>
                            );
                        })}
                    </div>
                </fieldset>
              </div>
              
              <div>
                <label htmlFor={`version-${client.id}`} className="block text-sm font-medium text-gray-700">Model Version</label>
                <input type="text" id={`version-${client.id}`} value={version} onChange={e => setVersion(e.target.value)} placeholder="e.g., v1.0.2" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50">
                      Cancel
                  </button>
                  <button type="submit" className={`py-2 px-4 flex justify-center items-center border border-transparent rounded-md shadow-sm text-sm font-semibold text-white ${client.darkColor} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`} disabled={!file || isSubmitting}>
                      {isSubmitting ? (
                          <>
                            <Spinner />
                            Uploading...
                          </>
                      ) : (
                          'Start Federated Training'
                      )}
                  </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};