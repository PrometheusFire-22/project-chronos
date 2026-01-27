from sqlalchemy import Column, DateTime, Integer, MetaData, String, Text
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func

# Define the metadata with the appropriate schema
metadata = MetaData(schema="metadata")
Base = declarative_base(metadata=metadata)


class DataCatalog(Base):
    """
    Model for storing economic data catalog entries (e.g., StatsCan vectors, FRED series).

    Attributes:
        id (int): Primary key.
        source (str): Data source (e.g., 'statscan', 'fred').
        series_id (str): Unique identifier from the source (e.g., 'v41690973').
        title (str): Descriptive title of the series.
        frequency (str): Update frequency (e.g., 'Monthly', 'Daily').
        units (str): Unit of measurement (e.g., 'Index, 2002=100').
        description (str): Detailed description or notes.
        last_updated (datetime): Timestamp of the last local update/check.
    """

    __tablename__ = "data_catalogs"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(50), nullable=False, index=True)  # e.g., 'statscan', 'fred'
    series_id = Column(String(100), nullable=False, index=True)  # vector_id or series_id
    title = Column(Text, nullable=False)
    frequency = Column(String(50), nullable=True)
    units = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    product_id = Column(String(50), nullable=True)  # Specific to StatsCan (Cube ID)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<DataCatalog(source='{self.source}', series_id='{self.series_id}', title='{self.title}')>"
