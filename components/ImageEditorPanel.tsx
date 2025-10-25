import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { LoaderIcon, UploadIcon, WandIcon } from './icons';

export const ImageEditorPanel: React.FC = () => {
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [editPrompt, setEditPrompt] = useState<string>('');
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file.');
                return;
            }
            setSourceFile(file);
            setEditedImage(null);
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSourceImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = async () => {
        if (!sourceImage || !editPrompt.trim() || !sourceFile) {
            setError("Please upload an image and provide an edit prompt.");
            return;
        }
        setIsEditing(true);
        setError(null);
        setEditedImage(null);

        const base64Data = sourceImage.split(',')[1];

        const resultBase64 = await editImage(base64Data, sourceFile.type, editPrompt.trim());

        if (resultBase64) {
            const newImageUrl = `data:${sourceFile.type};base64,${resultBase64}`;
            setEditedImage(newImageUrl);
        } else {
            setError("Failed to edit the image. Please try again later.");
        }
        setIsEditing(false);
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex-shrink-0">
                <h2 className="text-xl font-medium text-purple-300 mb-2">AI Image Editor</h2>
                <p className="text-sm text-stone-400 mb-6">
                    Upload an image and describe the changes you want to make.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {!sourceImage && (
                    <div
                        className="flex flex-col items-center justify-center border-2 border-dashed border-stone-700 rounded-lg p-12 text-center cursor-pointer hover:border-purple-500 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadIcon className="w-10 h-10 text-stone-500 mb-4" />
                        <span className="text-purple-300 font-semibold">Click to upload an image</span>
                        <span className="text-xs text-stone-500 mt-1">PNG, JPG, WEBP, etc.</span>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                {sourceImage && (
                    <div>
                        <label className="text-sm text-stone-400 font-medium">Your Image</label>
                        <img src={sourceImage} alt="Source" className="mt-2 rounded-lg border border-stone-700 w-full" />
                        <button 
                            onClick={() => {
                                setSourceImage(null);
                                setSourceFile(null);
                                setEditedImage(null);
                                setEditPrompt('');
                            }}
                            className="text-xs text-purple-400 hover:underline mt-2"
                        >
                            Use a different image
                        </button>
                    </div>
                )}
                
                {sourceImage && (
                    <div className="space-y-4">
                         <textarea
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            placeholder='e.g., "Add a retro filter" or "Make the sky look like a galaxy"'
                            className="w-full bg-stone-950 text-stone-300 p-3 rounded-lg border border-stone-700 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none placeholder-stone-600 text-sm"
                            rows={3}
                            disabled={isEditing}
                        />
                        <button
                            onClick={handleEdit}
                            disabled={isEditing || !editPrompt.trim()}
                            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-lg disabled:bg-stone-600 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-900/30"
                        >
                            {isEditing ? (
                                <>
                                    <LoaderIcon className="w-5 h-5" />
                                    <span>Applying Magic...</span>
                                </>
                            ) : (
                                <>
                                    <WandIcon className="w-5 h-5" />
                                    <span>Apply Edit</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                {isEditing && (
                    <div className="flex flex-col items-center justify-center bg-stone-900/50 rounded-lg p-8">
                        <LoaderIcon className="w-12 h-12" />
                        <p className="text-stone-400 mt-4">Editing in progress...</p>
                    </div>
                )}

                {editedImage && (
                    <div>
                        <label className="text-sm text-purple-300 font-medium">Edited Image</label>
                        <img src={editedImage} alt="Edited" className="mt-2 rounded-lg border-2 border-purple-500 w-full" />
                    </div>
                )}
            </div>
        </div>
    );
};