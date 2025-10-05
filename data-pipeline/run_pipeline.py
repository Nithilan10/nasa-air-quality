#!/usr/bin/env python3
"""
Comprehensive Data Pipeline Runner for Asthma-Focused Air Quality App

This script orchestrates the collection of data from all sources:
- Ground-based monitoring (OpenAQ, EPA AirNow, PurpleAir, Pandora)
- Satellite data (TEMPO, MODIS, Sentinel-5P)
- Weather data (OpenWeather, NOAA, pollen, fire weather)
- Health data (WHO, CDC, local health departments)
- Carbon footprint data (EPA emissions, EIA energy, transportation, food)
- Pollen and allergy data (Pollen.com, weather services, allergy clinics)

The pipeline is designed specifically for people with asthma and respiratory conditions.
"""

import sys
import os
from pathlib import Path
import datetime
import argparse
import logging
from typing import List, Dict, Optional

# Add the data-pipeline directory to the Python path
sys.path.append(str(Path(__file__).parent))

# Import all fetching modules
from fetching.fetch_ground import fetch_all_ground_data
from fetching.fetch_satellite import download_all_satellite_data
from fetching.fetch_weather import fetch_all_weather_data
from fetching.fetch_health import fetch_all_health_data
from fetching.fetch_carbon import fetch_all_carbon_data
from fetching.fetch_pollen import fetch_all_pollen_data

# Import processing modules
from preprocess import preprocess
from utils import validate_data_quality, create_data_summary

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DataPipelineRunner:
    """Main class to orchestrate the data pipeline"""
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.start_time = datetime.datetime.now()
        self.results = {}
        
    def run_ground_data_collection(self) -> bool:
        """Run ground-based data collection"""
        try:
            logger.info("Starting ground-based data collection...")
            result = fetch_all_ground_data()
            self.results['ground_data'] = {
                'success': True,
                'records': len(result) if not result.empty else 0,
                'timestamp': datetime.datetime.now().isoformat()
            }
            logger.info(f"Ground data collection completed: {len(result)} records")
            return True
        except Exception as e:
            logger.error(f"Ground data collection failed: {e}")
            self.results['ground_data'] = {
                'success': False,
                'error': str(e),
                'timestamp': datetime.datetime.now().isoformat()
            }
            return False
    
    def run_satellite_data_collection(self) -> bool:
        """Run satellite data collection"""
        try:
            logger.info("Starting satellite data collection...")
            bbox = self.config.get('bounding_box', [-125.0, 24.0, -66.0, 49.0])  # North America
            result = download_all_satellite_data(bbox=bbox)
            self.results['satellite_data'] = {
                'success': True,
                'records': len(result) if not result.empty else 0,
                'timestamp': datetime.datetime.now().isoformat()
            }
            logger.info(f"Satellite data collection completed: {len(result)} records")
            return True
        except Exception as e:
            logger.error(f"Satellite data collection failed: {e}")
            self.results['satellite_data'] = {
                'success': False,
                'error': str(e),
                'timestamp': datetime.datetime.now().isoformat()
            }
            return False
    
    def run_weather_data_collection(self) -> bool:
        """Run weather data collection"""
        try:
            logger.info("Starting weather data collection...")
            result = fetch_all_weather_data()
            self.results['weather_data'] = {
                'success': True,
                'records': len(result) if not result.empty else 0,
                'timestamp': datetime.datetime.now().isoformat()
            }
            logger.info(f"Weather data collection completed: {len(result)} records")
            return True
        except Exception as e:
            logger.error(f"Weather data collection failed: {e}")
            self.results['weather_data'] = {
                'success': False,
                'error': str(e),
                'timestamp': datetime.datetime.now().isoformat()
            }
            return False
    
    def run_health_data_collection(self) -> bool:
        """Run health data collection"""
        try:
            logger.info("Starting health data collection...")
            result = fetch_all_health_data()
            self.results['health_data'] = {
                'success': True,
                'records': len(result) if not result.empty else 0,
                'timestamp': datetime.datetime.now().isoformat()
            }
            logger.info(f"Health data collection completed: {len(result)} records")
            return True
        except Exception as e:
            logger.error(f"Health data collection failed: {e}")
            self.results['health_data'] = {
                'success': False,
                'error': str(e),
                'timestamp': datetime.datetime.now().isoformat()
            }
            return False
    
    def run_carbon_data_collection(self) -> bool:
        """Run carbon footprint data collection"""
        try:
            logger.info("Starting carbon footprint data collection...")
            result = fetch_all_carbon_data()
            self.results['carbon_data'] = {
                'success': True,
                'records': len(result) if not result.empty else 0,
                'timestamp': datetime.datetime.now().isoformat()
            }
            logger.info(f"Carbon data collection completed: {len(result)} records")
            return True
        except Exception as e:
            logger.error(f"Carbon data collection failed: {e}")
            self.results['carbon_data'] = {
                'success': False,
                'error': str(e),
                'timestamp': datetime.datetime.now().isoformat()
            }
            return False
    
    def run_pollen_data_collection(self) -> bool:
        """Run pollen and allergy data collection"""
        try:
            logger.info("Starting pollen and allergy data collection...")
            result = fetch_all_pollen_data()
            self.results['pollen_data'] = {
                'success': True,
                'records': len(result) if not result.empty else 0,
                'timestamp': datetime.datetime.now().isoformat()
            }
            logger.info(f"Pollen data collection completed: {len(result)} records")
            return True
        except Exception as e:
            logger.error(f"Pollen data collection failed: {e}")
            self.results['pollen_data'] = {
                'success': False,
                'error': str(e),
                'timestamp': datetime.datetime.now().isoformat()
            }
            return False
    
    def run_data_processing(self) -> bool:
        """Run data preprocessing and feature engineering"""
        try:
            logger.info("Starting data preprocessing...")
            result = preprocess()
            self.results['data_processing'] = {
                'success': True,
                'records': len(result) if not result.empty else 0,
                'timestamp': datetime.datetime.now().isoformat()
            }
            logger.info(f"Data processing completed: {len(result)} records")
            return True
        except Exception as e:
            logger.error(f"Data processing failed: {e}")
            self.results['data_processing'] = {
                'success': False,
                'error': str(e),
                'timestamp': datetime.datetime.now().isoformat()
            }
            return False
    
    def run_full_pipeline(self, skip_collection: bool = False) -> Dict:
        """Run the complete data pipeline"""
        logger.info("Starting comprehensive data pipeline for asthma-focused air quality app")
        logger.info(f"Pipeline started at: {self.start_time}")
        
        pipeline_steps = [
            ("Ground Data Collection", self.run_ground_data_collection),
            ("Satellite Data Collection", self.run_satellite_data_collection),
            ("Weather Data Collection", self.run_weather_data_collection),
            ("Health Data Collection", self.run_health_data_collection),
            ("Carbon Data Collection", self.run_carbon_data_collection),
            ("Pollen Data Collection", self.run_pollen_data_collection),
            ("Data Processing", self.run_data_processing)
        ]
        
        if skip_collection:
            # Skip data collection steps, only run processing
            pipeline_steps = [("Data Processing", self.run_data_processing)]
        
        successful_steps = 0
        total_steps = len(pipeline_steps)
        
        for step_name, step_function in pipeline_steps:
            logger.info(f"Running: {step_name}")
            if step_function():
                successful_steps += 1
                logger.info(f"✓ {step_name} completed successfully")
            else:
                logger.error(f"✗ {step_name} failed")
        
        # Generate pipeline summary
        end_time = datetime.datetime.now()
        duration = end_time - self.start_time
        
        pipeline_summary = {
            'pipeline_info': {
                'start_time': self.start_time.isoformat(),
                'end_time': end_time.isoformat(),
                'duration_seconds': duration.total_seconds(),
                'successful_steps': successful_steps,
                'total_steps': total_steps,
                'success_rate': (successful_steps / total_steps) * 100
            },
            'step_results': self.results
        }
        
        logger.info(f"Pipeline completed in {duration}")
        logger.info(f"Success rate: {(successful_steps / total_steps) * 100:.1f}% ({successful_steps}/{total_steps})")
        
        return pipeline_summary
    
    def run_health_focused_pipeline(self) -> Dict:
        """Run a health-focused subset of the pipeline"""
        logger.info("Running health-focused data pipeline for asthma monitoring")
        
        # Focus on data most relevant to asthma and respiratory health
        health_steps = [
            ("Ground Data Collection", self.run_ground_data_collection),
            ("Weather Data Collection", self.run_weather_data_collection),
            ("Health Data Collection", self.run_health_data_collection),
            ("Pollen Data Collection", self.run_pollen_data_collection),
            ("Data Processing", self.run_data_processing)
        ]
        
        successful_steps = 0
        for step_name, step_function in health_steps:
            logger.info(f"Running: {step_name}")
            if step_function():
                successful_steps += 1
                logger.info(f"✓ {step_name} completed successfully")
            else:
                logger.error(f"✗ {step_name} failed")
        
        return self.results

def main():
    """Main entry point for the data pipeline"""
    parser = argparse.ArgumentParser(description="Run the asthma-focused air quality data pipeline")
    parser.add_argument("--mode", choices=["full", "health", "processing"], default="full",
                       help="Pipeline mode: full (all data), health (health-focused), processing (preprocessing only)")
    parser.add_argument("--skip-collection", action="store_true",
                       help="Skip data collection, only run preprocessing")
    parser.add_argument("--config", type=str, help="Path to configuration file")
    parser.add_argument("--log-level", choices=["DEBUG", "INFO", "WARNING", "ERROR"], 
                       default="INFO", help="Logging level")
    
    args = parser.parse_args()
    
    # Set logging level
    logging.getLogger().setLevel(getattr(logging, args.log_level))
    
    # Load configuration if provided
    config = {}
    if args.config and os.path.exists(args.config):
        import json
        with open(args.config, 'r') as f:
            config = json.load(f)
    
    # Initialize and run pipeline
    runner = DataPipelineRunner(config)
    
    if args.mode == "full":
        results = runner.run_full_pipeline(skip_collection=args.skip_collection)
    elif args.mode == "health":
        results = runner.run_health_focused_pipeline()
    elif args.mode == "processing":
        results = runner.run_data_processing()
    
    # Save results
    results_file = Path("pipeline_results.json")
    import json
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    logger.info(f"Pipeline results saved to {results_file}")
    
    # Print summary
    if 'pipeline_info' in results:
        info = results['pipeline_info']
        print(f"\n{'='*50}")
        print(f"PIPELINE SUMMARY")
        print(f"{'='*50}")
        print(f"Duration: {info['duration_seconds']:.1f} seconds")
        print(f"Success Rate: {info['success_rate']:.1f}%")
        print(f"Successful Steps: {info['successful_steps']}/{info['total_steps']}")
        print(f"{'='*50}")

if __name__ == "__main__":
    main()
